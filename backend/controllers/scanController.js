const { supabaseAdmin } = require('../config/supabase');

const normalizeText = (value) => {
  if (value === undefined || value === null) return undefined;
  const out = String(value).trim();
  return out.length ? out : undefined;
};

const normalizeGrade = (value) => {
  const cleaned = normalizeText(value);
  return cleaned ? cleaned.toUpperCase() : 'UNKNOWN';
};

const normalizeNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

// @desc    Get all scans (admin)
// @route   GET /api/scan
// @access  Private (Admin)
const getScans = async (req, res) => {
  try {
    const { data: scans, error } = await supabaseAdmin
      .from('scans')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json(scans || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new scan
// @route   POST /api/scan
// @access  Public/Private
const createScan = async (req, res) => {
  try {
    const {
      grade, details, imageUrl, location, timestamp,
      userId, operatorName, operatorEmail, fruitType, localScanId, source,
      estimated_price_per_kg, estimatedPricePerKg,
      fruit_area_ratio, fruitAreaRatio,
      size_category, sizeCategory,
      market_value_label, marketValueLabel,
      weight_grams_est, weightGramsEst,
      ripeness_score, ripenessScore,
      quality_score, qualityScore,
      shelf_life_label, shelfLifeLabel,
    } = req.body;

    const normalizedEmail = normalizeText(operatorEmail)?.toLowerCase();
    const parsedTimestamp = timestamp ? new Date(timestamp) : null;
    const safeTimestamp = parsedTimestamp && !Number.isNaN(parsedTimestamp.getTime())
      ? parsedTimestamp.toISOString()
      : new Date().toISOString();

    const payload = {
      grade: normalizeGrade(grade),
      details: normalizeText(details),
      image_url: normalizeText(imageUrl),
      location: normalizeText(location),
      timestamp: safeTimestamp,
      operator_name: normalizeText(operatorName),
      operator_email: normalizedEmail,
      fruit_type: normalizeText(fruitType),
      local_scan_id: normalizeText(localScanId),
      source: normalizeText(source) || 'mobile_app',
      estimated_price_per_kg: normalizeNumber(estimated_price_per_kg ?? estimatedPricePerKg),
      fruit_area_ratio: normalizeNumber(fruit_area_ratio ?? fruitAreaRatio),
      size_category: normalizeText(size_category ?? sizeCategory),
      market_value_label: normalizeText(market_value_label ?? marketValueLabel),
      weight_grams_est: normalizeNumber(weight_grams_est ?? weightGramsEst),
      ripeness_score: normalizeNumber(ripeness_score ?? ripenessScore),
      quality_score: normalizeNumber(quality_score ?? qualityScore),
      shelf_life_label: normalizeText(shelf_life_label ?? shelfLifeLabel),
    };

    // Link to Supabase user if userId provided
    if (normalizeText(userId)) {
      payload.user_id = normalizeText(userId);
    }

    let scan;
    let statusCode = 201;

    // Deduplication by localScanId + operatorEmail
    if (payload.local_scan_id && normalizedEmail) {
      const { data: existing } = await supabaseAdmin
        .from('scans')
        .select('id, created_at, updated_at')
        .eq('local_scan_id', payload.local_scan_id)
        .eq('operator_email', normalizedEmail)
        .maybeSingle();

      if (existing) {
        const { data: updated, error } = await supabaseAdmin
          .from('scans')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) return res.status(500).json({ message: error.message });
        scan = updated;
        statusCode = 200;
      } else {
        const { data: created, error } = await supabaseAdmin
          .from('scans')
          .insert(payload)
          .select()
          .single();
        if (error) return res.status(500).json({ message: error.message });
        scan = created;
      }
    } else {
      const { data: created, error } = await supabaseAdmin
        .from('scans')
        .insert(payload)
        .select()
        .single();
      if (error) return res.status(500).json({ message: error.message });
      scan = created;
    }

    return res.status(statusCode).json(scan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete scan by local scan id
// @route   DELETE /api/scan/:localScanId
// @access  Private (User)
const deleteScanByLocalScanId = async (req, res) => {
  try {
    const scanIdentifier = normalizeText(req.params.localScanId);
    if (!scanIdentifier) {
      return res.status(400).json({ message: 'localScanId is required' });
    }

    const operatorEmail = normalizeText(req.query.operatorEmail)?.toLowerCase();
    const userId = normalizeText(req.query.userId);

    if (!operatorEmail && !userId) {
      return res.status(400).json({ message: 'userId or operatorEmail is required' });
    }

    let query = supabaseAdmin.from('scans').delete().eq('local_scan_id', scanIdentifier);
    if (operatorEmail) query = query.eq('operator_email', operatorEmail);
    else if (userId) query = query.eq('user_id', userId);

    const { data: deleted, error } = await query.select().maybeSingle();
    if (error) return res.status(500).json({ message: error.message });
    if (!deleted) return res.status(404).json({ message: 'Scan not found' });

    return res.status(200).json({ message: 'Scan deleted', id: deleted.id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete all scans for a user
// @route   DELETE /api/scan
// @access  Private (User)
const deleteAllScansForUser = async (req, res) => {
  try {
    const operatorEmail = normalizeText(req.query.operatorEmail)?.toLowerCase();
    const userId = normalizeText(req.query.userId);

    if (!operatorEmail && !userId) {
      return res.status(400).json({ message: 'userId or operatorEmail is required' });
    }

    let query = supabaseAdmin.from('scans').delete();
    if (operatorEmail) query = query.eq('operator_email', operatorEmail);
    else if (userId) query = query.eq('user_id', userId);

    if (req.query.source) query = query.eq('source', req.query.source);

    const { data, error } = await query.select('id');
    if (error) return res.status(500).json({ message: error.message });

    return res.status(200).json({
      message: 'Scans deleted',
      deletedCount: data?.length || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get scan statistics
// @route   GET /api/scan/stats
// @access  Private (Admin)
const getScanStats = async (req, res) => {
  try {
    const { count: total } = await supabaseAdmin.from('scans').select('*', { count: 'exact', head: true });

    // Grade distribution
    const { data: allScans } = await supabaseAdmin.from('scans').select('grade');
    const gradeMap = {};
    (allScans || []).forEach((s) => {
      const g = s.grade || 'UNKNOWN';
      gradeMap[g] = (gradeMap[g] || 0) + 1;
    });
    const gradeStats = Object.entries(gradeMap).map(([_id, count]) => ({ _id, count }));

    const grades = Object.keys(gradeMap);
    let best = '-';
    if (grades.includes('A')) best = 'A';
    else if (grades.includes('B')) best = 'B';
    else if (grades.includes('C')) best = 'C';
    else if (grades.includes('D')) best = 'D';
    else if (grades.includes('E')) best = 'E';

    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: recentScans } = await supabaseAdmin
      .from('scans')
      .select('timestamp')
      .gte('timestamp', sevenDaysAgo.toISOString());

    const dayMap = {};
    (recentScans || []).forEach((s) => {
      const day = s.timestamp?.slice(0, 10);
      if (day) dayMap[day] = (dayMap[day] || 0) + 1;
    });
    const last7Days = Object.entries(dayMap).map(([_id, count]) => ({ _id, count })).sort((a, b) => a._id.localeCompare(b._id));

    // Last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const { data: monthlyScans } = await supabaseAdmin
      .from('scans')
      .select('timestamp')
      .gte('timestamp', sixMonthsAgo.toISOString());

    const monthMap = {};
    (monthlyScans || []).forEach((s) => {
      const month = s.timestamp?.slice(0, 7);
      if (month) monthMap[month] = (monthMap[month] || 0) + 1;
    });
    const last6Months = Object.entries(monthMap).map(([_id, count]) => ({ _id, count })).sort((a, b) => a._id.localeCompare(b._id));

    return res.status(200).json({ total, best, gradeStats, last7Days, last6Months });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Helper to build 7-day buckets
const buildLast7DayBuckets = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setHours(0, 0, 0, 0);
    day.setDate(today.getDate() - (6 - i));
    return {
      isoDate: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      total: 0, mobile: 0, web: 0,
    };
  });
};

// @desc    Get analytics data
// @route   GET /api/scan/analytics
// @access  Private (Admin)
const getScanAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      { count: totalScans },
      { count: totalUsers },
      { count: activeUsers },
      { data: allScans },
      { data: logins24hProfiles },
    ] = await Promise.all([
      supabaseAdmin.from('scans').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('scans').select('grade, source, timestamp').gte('timestamp', sevenDaysAgo.toISOString()),
      supabaseAdmin.from('profiles').select('last_login_at').gte('last_login_at', twentyFourHoursAgo.toISOString()),
    ]);

    const trendBuckets = buildLast7DayBuckets();
    const trendByDay = new Map(trendBuckets.map((b) => [b.isoDate, b]));

    const gradeMap = {};
    const sourceMap = {};
    let rotSignals = 0, insectSignals = 0, fungalSignals = 0;

    (allScans || []).forEach((s) => {
      const grade = String(s.grade || 'UNKNOWN').toUpperCase();
      gradeMap[grade] = (gradeMap[grade] || 0) + 1;

      const src = String(s.source || 'unknown').toLowerCase();
      const srcLabel = src.includes('mobile') ? 'Mobile' : src.includes('web') ? 'Web' : 'Unknown';
      sourceMap[srcLabel] = (sourceMap[srcLabel] || 0) + 1;

      const day = s.timestamp?.slice(0, 10);
      const bucket = trendByDay.get(day);
      if (bucket) {
        bucket.total += 1;
        if (src.includes('mobile')) bucket.mobile += 1;
        else bucket.web += 1;
      }
    });

    // Login trend from profiles.last_login_at
    const { data: loginProfiles } = await supabaseAdmin
      .from('profiles')
      .select('last_login_at')
      .gte('last_login_at', sevenDaysAgo.toISOString());

    const loginByDay = {};
    (loginProfiles || []).forEach((p) => {
      const day = p.last_login_at?.slice(0, 10);
      if (day) loginByDay[day] = (loginByDay[day] || 0) + 1;
    });

    const gradeOrder = ['A', 'B', 'C', 'D', 'E', 'UNKNOWN'];
    const gradeDistribution = gradeOrder
      .map((grade) => ({ grade, count: gradeMap[grade] || 0 }))
      .filter((r) => r.count > 0);

    const sourceDistribution = Object.entries(sourceMap).map(([source, count]) => ({ source, count }));

    return res.status(200).json({
      generatedAt: new Date().toISOString(),
      totals: {
        scans: totalScans || 0,
        users: totalUsers || 0,
        activeUsers: activeUsers || 0,
        mobileScans: sourceMap['Mobile'] || 0,
        webScans: sourceMap['Web'] || 0,
        logins24h: logins24hProfiles?.length || 0,
      },
      scanTrend: trendBuckets.map(({ isoDate, label, total, mobile, web }) => ({
        date: isoDate, label, scans: total, mobileScans: mobile, webScans: web,
      })),
      loginTrend: trendBuckets.map(({ isoDate, label }) => ({
        date: isoDate, label, logins: loginByDay[isoDate] || 0,
      })),
      gradeDistribution,
      sourceDistribution,
      diseaseSignals: [
        { name: 'Rot/Decay Signal', count: rotSignals },
        { name: 'Fungal Signal', count: fungalSignals },
        { name: 'Insect Signal', count: insectSignals },
      ],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load analytics data' });
  }
};

module.exports = {
  getScans,
  createScan,
  deleteScanByLocalScanId,
  deleteAllScansForUser,
  getScanStats,
  getScanAnalytics,
};
