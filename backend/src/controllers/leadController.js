import Lead from '../models/Lead.js';

const statuses = ['New', 'Contacted', 'Qualified', 'Lost'];
export const listLeads = async (req, res, next) => {
  try {
    const { search = '', status = '', source = '', sortBy = 'createdAt', order = 'desc' } = req.query;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 8));
    const filter = { owner: req.user._id };
    if (search.trim()) filter.$or = ['name', 'email', 'company'].map(key => ({ [key]: { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }));
    if (statuses.includes(status)) filter.status = status;
    if (['Website', 'Referral', 'Social Media', 'Cold Call', 'Advertisement', 'Other'].includes(source)) filter.source = source;
    const safeSort = ['createdAt', 'name', 'status', 'company'].includes(sortBy) ? sortBy : 'createdAt';
    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ [safeSort]: order === 'asc' ? 1 : -1 }).skip((page - 1) * limit).limit(limit),
      Lead.countDocuments(filter)
    ]);
    res.json({ leads, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) { next(e); }
};
export const createLead = async (req, res, next) => {
  try { const lead = await Lead.create({ ...req.body, owner: req.user._id }); res.status(201).json({ lead }); }
  catch (e) { next(e); }
};
export const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true, runValidators: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ lead });
  } catch (e) { next(e); }
};
export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (e) { next(e); }
};
export const dashboard = async (req, res, next) => {
  try {
    const counts = await Lead.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byStatus = Object.fromEntries(statuses.map(s => [s, 0]));
    counts.forEach(({ _id, count }) => { byStatus[_id] = count; });
    res.json({ total: Object.values(byStatus).reduce((a, b) => a + b, 0), byStatus });
  } catch (e) { next(e); }
};
