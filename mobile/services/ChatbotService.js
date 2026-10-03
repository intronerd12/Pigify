import { ScanService } from './ScanService';
import { getEnvironment, getEnvironmentalReport } from './EnvironmentService';
import { apiFetch } from './api';

const normalize = (s) => String(s || '').trim();
const normLower = (s) => normalize(s).toLowerCase();

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const formatTemp = (v) => (typeof v === 'number' ? `${Math.round(v)}°C` : '—');
const formatWind = (v) => (typeof v === 'number' ? `${Math.round(v)} km/h` : '—');

const scanTips = () => {
  return [
    'Veterinary scanning tips for swine diagnostics:',
    '• Ensure good pen lighting (avoid harsh glare on wet swine skin).',
    '• Center lesion or rash in viewfinder reticle (12-24 inches away).',
    '• Gently wipe heavy mud/feed crust from the skin lesion.',
    '• Keep hands steady while the AI segments dermatitis boundaries.',
    '• Note the pen number and swine tag ID for epidemiological records.',
  ].join('\n');
};

const swineDiseaseAdvice = (topic) => {
  if (topic.includes('erysipelas') || topic.includes('diamond')) {
    return [
      'Diamond Skin Disease (Swine Erysipelas):',
      '• Symptoms: Raised diamond-shaped red/purple skin plaques, fever, lethargy, stiff gait.',
      '• Biosecurity Action: ISOLATE animal immediately to quarantine pen.',
      '• Treatment: Injectable Penicillin or broad-spectrum antimicrobial under veterinary guidance.',
      '• Prevention: Vaccinate herd at weaning; disinfect pen troughs and floor.',
    ].join('\n');
  }
  if (topic.includes('greasy') || topic.includes('epidermitis')) {
    return [
      'Greasy Pig Disease (Exudative Epidermitis):',
      '• Symptoms: Brown greasy/crusted skin lesions, predominantly affecting piglets and weaners.',
      '• Biosecurity Action: Separate affected piglets from crowded pens.',
      '• Treatment: Bathe affected skin with mild antiseptic (chlorhexidine), apply topical antibiotic.',
      '• Prevention: Smooth sharp pen floor surfaces, clip needle teeth, maintain dry bedding.',
    ].join('\n');
  }
  if (topic.includes('mange') || topic.includes('mite') || topic.includes('scratch')) {
    return [
      'Sarcoptic Swine Mange:',
      '• Symptoms: Excessive scratching against pen railings, thick crusted ear lesions.',
      '• Treatment: Avermectin (Ivermectin) injectable or topical treatment prescribed by a vet.',
      '• Prevention: Treat sow prior to farrowing; sanitize pen walls.',
    ].join('\n');
  }
  return [
    'Backyard Swine Health Protocol:',
    '• 1. Quarantine new herd arrivals for at least 21-30 days.',
    '• 2. Monitor pen ambient temperature: 24-28°C for nursery, 18-22°C for growers.',
    '• 3. Disinfect pen boot dips and feeding troughs weekly.',
    '• 4. Scan swine lesions at first sign of redness or skin crust.',
  ].join('\n');
};

const defaultHelp = () => {
  return [
    'Pigify Clinical AI Swine Assistant:',
    'I can assist you with:',
    '• Swine skin disease diagnosis (Erysipelas, Greasy Pig, Mange)',
    '• Photography tips for lesion AI segmentation',
    '• Backyard pen biosecurity & disinfection protocols',
    '• Your recent swine scan telemetry',
    '',
    'Try asking: “How to treat Erysipelas?”, “Greasy pig symptoms?”, “Scan tips”, or “Biosecurity protocol”.',
  ].join('\n');
};

export const ChatbotService = {
  reply: async ({ message, user } = {}) => {
    const raw = normalize(message);
    const text = normLower(raw);

    if (/(^|\b)(open|go to|show)(\b|\s).*weather/.test(text)) {
      return { text: 'Opening Weather…', action: { type: 'navigate', screen: 'Weather' } };
    }
    if (/(^|\b)(open|go to|show)(\b|\s).*(map|mapping|environment dashboard)/.test(text)) {
      return { text: 'Opening Mapping & Environmental Data…', action: { type: 'navigate', screen: 'MappingEnvironment' } };
    }
    if (/(^|\b)(open|go to|show)(\b|\s).*scan/.test(text)) {
      return { text: 'Opening Scan…', action: { type: 'navigate', screen: 'Scan' } };
    }
    if (/(^|\b)(open|go to|show)(\b|\s).*(guide|tips)/.test(text)) {
      return { text: 'Opening Guide…', action: { type: 'navigate', screen: 'Guide' } };
    }
    if (/(^|\b)(edit|update)(\b|\s).*(profile|account)/.test(text)) {
      return { text: 'Opening Edit Profile…', action: { type: 'navigate', screen: 'EditProfile' } };
    }

    if (text.includes('erysipelas') || text.includes('diamond') || text.includes('greasy') || text.includes('mange') || text.includes('biosecurity') || text.includes('disease') || text.includes('treatment') || text.includes('lesion')) {
      return { text: swineDiseaseAdvice(text) };
    }

    if (text.includes('scan tip') || text.includes('tips') || text.includes('photo') || text.includes('blurry') || text.includes('glare')) {
      return { text: scanTips() };
    }

    if (text.includes('stats') || text.includes('history') || text.includes('recent') || text.includes('my scans')) {
      const stats = await ScanService.getStats({ user });
      const scans = await ScanService.getScans({ user });
      const recent = scans.slice(0, 3);

      const lines = [
        'Your scan stats (this device):',
        `• Total scans: ${stats.total}`, 
        `• Best grade: ${stats.best}`,
        `• Average score: ${stats.avg}`,
      ];

      if (recent.length) {
        lines.push('', 'Recent scans:');
        recent.forEach((s, i) => {
          const when = s.timestamp ? `${new Date(s.timestamp).toLocaleDateString()} ${formatTime(s.timestamp)}` : '';
          const grade = s.grade || '-';
          const note = s.shelf_life_label || s.notes || '';
          lines.push(`• ${i + 1}) Grade ${grade}${when ? ` • ${when}` : ''}${note ? ` • ${note}` : ''}`);
        });
      } else {
        lines.push('', 'No scans found yet. Try the Scan tab to start.');
      }

      return { text: lines.join('\n') };
    }

    if (
      text.includes('weather') ||
      text.includes('temperature') ||
      text.includes('forecast') ||
      text.includes('wind') ||
      text.includes('location') ||
      text.includes('where am i') ||
      text.includes('map')
    ) {
      const wantsForecast = text.includes('forecast') || text.includes('7') || text.includes('7-day') || text.includes('7 day');
      try {
        if (wantsForecast) {
          const rep = await getEnvironmentalReport({ force: true, user });
          const place = rep.place?.label || 'your location';
          const cur = rep.forecast?.current;
          const days = Array.isArray(rep.forecast?.days) ? rep.forecast.days.slice(0, 5) : [];

          const lines = [
            `Forecast for ${place}:`,
            `• Now: ${formatTemp(cur?.temperatureC)} • ${cur?.weatherLabel || '—'} • Wind ${formatWind(cur?.windKmh)}`,
          ];

          if (days.length) {
            lines.push('', 'Next days:');
            days.forEach((d) => {
              const date = d.date ? new Date(d.date).toLocaleDateString() : '—';
              lines.push(
                `• ${date}: ${d.weatherLabel || '—'} • ${formatTemp(d.minTempC)}–${formatTemp(d.maxTempC)} • Rain ${typeof d.precipitationMm === 'number' ? `${Math.round(d.precipitationMm)} mm` : '—'}`
              );
            });
          }

          return {
            text: lines.join('\n'),
            card: {
              type: 'forecast',
              title: '7-day forecast',
              place,
              now: {
                temperature: formatTemp(cur?.temperatureC),
                conditions: cur?.weatherLabel || '—',
                wind: formatWind(cur?.windKmh),
              },
              days: days.map((d) => ({
                date: d.date ? new Date(d.date).toLocaleDateString() : '—',
                label: d.weatherLabel || '—',
                tempRange: `${formatTemp(d.minTempC)}–${formatTemp(d.maxTempC)}`,
                rain: typeof d.precipitationMm === 'number' ? `${Math.round(d.precipitationMm)} mm` : '—',
              })),
            },
          };
        }

        const env = await getEnvironment({ force: true, user });
        const place = env.place?.label || 'your location';
        const w = env.weather;
        const coords = env.coords;

        return {
          text: [
            `Weather now for ${place}:`,
            `• Temperature: ${formatTemp(w?.temperatureC)}`,
            `• Conditions: ${w?.weatherLabel || '—'}`,
            `• Wind: ${formatWind(w?.windKmh)}`,
            coords?.latitude && coords?.longitude
              ? `• Coordinates: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
              : null,
            '',
            'Tip: Ask “7-day forecast” for a longer outlook.',
          ].filter(Boolean).join('\n'),
          card: {
            type: 'weather',
            title: 'Weather now',
            place,
            metrics: [
              { label: 'Temperature', value: formatTemp(w?.temperatureC) },
              { label: 'Conditions', value: w?.weatherLabel || '—' },
              { label: 'Wind', value: formatWind(w?.windKmh) },
              coords?.latitude && coords?.longitude
                ? { label: 'Coordinates', value: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` }
                : null,
            ].filter(Boolean),
          },
        };
      } catch (e) {
        return {
          text: [
            'I couldn’t fetch location/weather right now.',
            '• Please allow Location permission and try again.',
            `• Details: ${e?.message || 'Unknown error'}`,
          ].join('\n'),
        };
      }
    }

    if (
      text.includes('account') ||
      text.includes('login') ||
      text.includes('log in') ||
      text.includes('logout') ||
      text.includes('log out') ||
      text.includes('profile') ||
      text.includes('password')
    ) {
      return { text: accountHelp(user) };
    }

    if (/^(hi|hello|hey|yo)\b/.test(text)) {
      return {
        text: 'Hi — ask me for scan tips, weather, scan stats, or account help.',
      };
    }

    try {
      const response = await apiFetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: raw,
          user: user
            ? {
                name: user.name,
                email: user.email,
              }
            : undefined,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data || typeof data.text !== 'string') {
        return { text: defaultHelp() };
      }

      return { text: data.text };
    } catch (e) {
      return { text: defaultHelp() };
    }
  },
};
