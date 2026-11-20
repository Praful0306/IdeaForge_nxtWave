-- NagarNetra Demo Seed Data: seed_demo.sql
-- Inserts 25 realistic civic grievances spread across Bengaluru (lat 12.90-13.03, lng 77.55-77.70)
-- Covers mixed categories, severities, statuses, created_at over the last 14 days, and resolved issues with after photos

-- Clear existing demo complaints to avoid ticket conflicts
truncate table status_events, reports, complaints cascade;

insert into complaints (
  id, ticket, category, sub_type, title, summary_en, summary_local, language,
  severity, severity_reasons, hazard_flags, department_id, status, priority,
  report_count, location, address, ward, cover_image_url, due_at, resolved_at, ai_confidence, created_at, updated_at
) values
-- 1. Critical open manhole near school (Sev 5)
(
  'a1111111-1111-1111-1111-111111111111', 'NN-9A2K', 'drainage', 'open_manhole',
  'Deep Open Manhole Near School Gate',
  'Uncovered storm drain manhole on 80ft road directly outside national school gate. Severe fall risk for schoolchildren and two-wheelers.',
  'ಶಾಲೆಯ ಮುಖ್ಯ ದ್ವಾರದ ಬಳಿ ತೆರೆದ ಮ್ಯಾನ್‌ಹೋಲ್ ಇದೆ. ಮಕ್ಕಳಿಗೆ ತೀವ್ರ ಅಪಾಯ.', 'kn',
  5, array['Open manhole > 1.5m deep', 'Directly in front of active school gate', 'High pedestrian footfall'],
  array['near_school', 'children', 'night_risk'], 'drainage', 'open',
  115.5, 4, st_makepoint(77.6385, 12.9716)::geography,
  '80 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038', 'Ward 112 - Domlur',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  now() + interval '2 hours', null, 0.96, now() - interval '2 hours', now() - interval '20 minutes'
),

-- 2. Live fallen wire sparking after rain (Sev 5)
(
  'a2222222-2222-2222-2222-222222222222', 'NN-3M7X', 'electrical', 'fallen_wire',
  'Live Electric Cable Hanging on Pavement',
  'Snapped 440V overhead distribution cable touching the wet pedestrian pavement. Active sparking observed during rain.',
  'फुटपाथ पर बिजली का नंगा तार गिरा हुआ है और चिंगारी निकल रही है।', 'hi',
  5, array['Live exposed conductor', 'Touching wet ground', 'High electrocution hazard'],
  array['electrical', 'traffic_risk', 'night_risk'], 'electrical', 'in_progress',
  112.0, 3, st_makepoint(77.5946, 12.9784)::geography,
  'Kasturba Road, Sampangi Rama Nagara, Bengaluru 560001', 'Ward 110 - Sampangiram Nagar',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
  now() - interval '1 hour', null, 0.98, now() - interval '3 hours', now() - interval '15 minutes'
),

-- 3. Massive drinking water pipeline burst (Sev 4)
(
  'a3333333-3333-3333-3333-333333333333', 'NN-5T8P', 'water', 'pipe_leak',
  'Major Water Main Burst Flooding Street',
  'Treated drinking water main pipeline fractured, shooting 3m water fountain and eroding road sub-base rapidly.',
  'ಮುಖ್ಯ ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್ ಒಡೆದು ರಸ್ತೆ ಜಲಾವೃತವಾಗಿದೆ.', 'kn',
  4, array['High volume water loss', 'Erosion of asphalt surface', 'Low water pressure to 500 households'],
  array['flooding', 'traffic_risk'], 'water', 'acknowledged',
  89.0, 3, st_makepoint(77.5732, 12.9250)::geography,
  '9th Main Rd, 4th Block, Jayanagar, Bengaluru 560011', 'Ward 153 - Jayanagar',
  'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
  now() + interval '8 hours', null, 0.94, now() - interval '4 hours', now() - interval '1 hour'
),

-- 4. Deep crater pothole on arterial flyover ramp (Sev 4)
(
  'a4444444-4444-4444-4444-444444444444', 'NN-7Q2W', 'roads', 'pothole',
  'Dangerous Crater on Flyover Descent Ramp',
  'Large crater pothole (approx 20cm deep) on flyover exit lane. Two-wheeler skidding hazard at moderate descent speeds.',
  'फ्लाईओवर से उतरते समय बहुत बड़ा गड्ढा है, बाइक फिसल रही हैं।', 'hi',
  4, array['Deep pothole on high speed ramp', 'Direct two-wheeler tipping risk'],
  array['traffic_risk', 'night_risk'], 'roads', 'open',
  86.0, 2, st_makepoint(77.6200, 12.9352)::geography,
  'Hosur Main Rd, Koramangala 1st Block, Bengaluru 560034', 'Ward 151 - Koramangala',
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  now() + interval '18 hours', null, 0.92, now() - interval '6 hours', now() - interval '2 hours'
),

-- 5. Overflowing black garbage dump next to clinic (Sev 4)
(
  'a5555555-5555-5555-5555-555555555555', 'NN-2E4V', 'sanitation', 'garbage_dump',
  'Unregulated Rotten Waste Dump by Dispensary',
  'Uncollected municipal mixed garbage accumulation spilling across 25 meters beside primary health centre gate.',
  'ಆಸ್ಪತ್ರೆಯ ಪಕ್ಕದಲ್ಲಿಯೇ ಕಸದ ರಾಶಿ ಬಿದ್ದಿದೆ, ದುರ್ವಾಸನೆ ಬರುತ್ತಿದೆ.', 'kn',
  4, array['Health biohazard next to clinic', 'Stagnant leachate attracting disease vectors'],
  array['near_hospital', 'health'], 'sanitation', 'open',
  98.0, 6, st_makepoint(77.6012, 12.9103)::geography,
  'Bannerghatta Main Rd, BTM 2nd Stage, Bengaluru 560076', 'Ward 176 - BTM Layout',
  'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
  now() + interval '14 hours', null, 0.91, now() - interval '10 hours', now() - interval '3 hours'
),

-- 6. Open chemical burning creating toxic smog (Sev 4)
(
  'a6666666-6666-6666-6666-666666666666', 'NN-8Y1Z', 'pollution', 'smoke_burning',
  'Open Plastic and Rubber Burning in Vacant Plot',
  'Dense toxic black smoke from burning industrial packaging plastic blowing toward apartment residential blocks.',
  'खाली प्लॉट में प्लास्टिक जलाया जा रहा है, सांस लेना मुश्किल है।', 'hi',
  4, array['Combustion of chlorinated plastics', 'Asthma trigger in dense residential cluster'],
  array['health', 'children'], 'pollution', 'open',
  83.0, 1, st_makepoint(77.6740, 12.9860)::geography,
  'Outer Ring Rd, Mahadevapura, Bengaluru 560048', 'Ward 82 - Garudacharpalya',
  'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
  now() + interval '12 hours', null, 0.89, now() - interval '8 hours', now() - interval '4 hours'
),

-- 7. Broken footpath slabs with iron rebar (Sev 3)
(
  'a7777777-7777-7777-7777-777777777777', 'NN-6K4L', 'roads', 'broken_footpath',
  'Cracked Concrete Slabs with Exposed Rebar',
  'Pedestrian footpath pavers shattered; rusted iron reinforcements exposed. Trip hazard for senior citizens.',
  'ಫುಟ್‌ಪಾತ್ ಸ್ಲ್ಯಾಬ್ ಒಡೆದು ಕಬ್ಬಿಣದ ಕಂಬಿಗಳು ಹೊರಬಂದಿವೆ.', 'kn',
  3, array['Exposed rusty rebar', 'Pedestrians forced onto motorized carriageway'],
  array['traffic_risk'], 'roads', 'in_progress',
  63.0, 1, st_makepoint(77.5648, 12.9912)::geography,
  'Margosa Rd, Malleshwaram, Bengaluru 560003', 'Ward 45 - Malleshwaram',
  'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
  now() + interval '40 hours', null, 0.88, now() - interval '1 day', now() - interval '5 hours'
),

-- 8. Streetlights non-functional on dark cross road (Sev 3)
(
  'a8888888-8888-8888-8888-888888888888', 'NN-4D9J', 'electrical', 'streetlight_out',
  'Five Consecutive Streetlights Dark on Cross Road',
  'Complete blackout across 150m of 14th Cross residential stretch. Public safety concern for evening commuters.',
  'लगातार 5 स्ट्रीट लाइटें बंद हैं, रास्ता बिल्कुल अंधेरा है।', 'hi',
  3, array['Zero street illumination', 'Safety risk for women and elderly after 7 PM'],
  array['night_risk'], 'electrical', 'acknowledged',
  69.0, 3, st_makepoint(77.5855, 12.9344)::geography,
  '14th Cross Rd, Wilson Garden, Bengaluru 560027', 'Ward 144 - Siddapura',
  'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
  now() + interval '36 hours', null, 0.95, now() - interval '18 hours', now() - interval '6 hours'
),

-- 9. Overflowing drain during pre-monsoon shower (Sev 3)
(
  'a9999999-9999-9999-9999-999999999999', 'NN-1R3C', 'drainage', 'sewage_overflow',
  'Blocked Secondary Drain Spilling on Road',
  'Silt choked storm drain overflowing dirty runoff across road corner. Stagnant puddle forming.',
  'ಚರಂಡಿ ಕಟ್ಟಿಕೊಂಡು ಕೊಳಚೆ ನೀರು ರಸ್ತೆಗೆ ಹರಿಯುತ್ತಿದೆ.', 'kn',
  3, array['Blocked inlet grate', 'Impending water stagnation'],
  array['health'], 'drainage', 'open',
  60.0, 1, st_makepoint(77.6105, 12.9150)::geography,
  '29th Main Rd, BTM 1st Stage, Bengaluru 560068', 'Ward 176 - BTM Layout',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  now() + interval '48 hours', null, 0.87, now() - interval '1 day', now() - interval '12 hours'
),

-- 10. Water supply pipe weeping steady leak (Sev 2)
(
  'b1111111-1111-1111-1111-111111111111', 'NN-9B5N', 'water', 'pipe_leak',
  'Underground Connection Weeping Water',
  'Small pressurized pinhole leak from pipe joint bubbling into roadside mud. Steady 1 L/min trickle.',
  'पानी के पाइप के जॉइंट से लगातार पानी रिस रहा है।', 'hi',
  2, array['Minor water wastage', 'Subgrade saturation over time'],
  array[]::text[], 'water', 'open',
  40.0, 1, st_makepoint(77.5501, 12.9602)::geography,
  'Dr Rajkumar Rd, Rajajinagar, Bengaluru 560010', 'Ward 99 - Rajajinagar',
  'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
  now() + interval '72 hours', null, 0.93, now() - interval '2 days', now() - interval '1 day'
),

-- 11. Overdue Pothole complaint (Sev 4, overdue by 36 hours -> high priority boost)
(
  'b2222222-2222-2222-2222-222222222222', 'NN-4K8V', 'roads', 'pothole',
  'Unattended Pothole Outside Railway Station',
  'Deep pothole at high-traffic station auto-stand exit. Past 24-hour statutory repair SLA window.',
  'रेलवे स्टेशन के बाहर बड़ा गड्ढा कई दिनों से ठीक नहीं हुआ है।', 'hi',
  4, array['Severe traffic bottleneck', 'Overdue beyond statutory emergency SLA'],
  array['traffic_risk'], 'roads', 'open',
  113.0, 5, st_makepoint(77.5710, 12.9778)::geography,
  'Krantivira Sangolli Rayanna Station Rd, Majestic, Bengaluru 560023', 'Ward 94 - Gandhinagar',
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  now() - interval '36 hours', null, 0.96, now() - interval '3 days', now() - interval '2 hours'
),

-- 12. Resolved complaint with before/after photos (Sev 4)
(
  'b3333333-3333-3333-3333-333333333333', 'NN-7X2A', 'sanitation', 'garbage_dump',
  'Cleaned Commercial Market Waste Dump',
  'Previously overflowing vegetable market dumpster cleared and area disinfected with bleaching powder.',
  'ಮಾರುಕಟ್ಟೆಯ ಕಸದ ರಾಶಿಯನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಲಾಗಿದೆ.', 'kn',
  4, array['Cleared within SLA', 'Sanitized against fly breeding'],
  array['health'], 'sanitation', 'resolved',
  80.0, 2, st_makepoint(77.6080, 12.9420)::geography,
  'Adugodi Main Rd, Bengaluru 560030', 'Ward 147 - Adugodi',
  'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
  now() - interval '2 days', now() - interval '1 day', 0.95, now() - interval '3 days', now() - interval '1 day'
),

-- 13. Resolved pothole cold-mix repair with proof (Sev 3)
(
  'b4444444-4444-4444-4444-444444444444', 'NN-5L3M', 'roads', 'pothole',
  'Repaired Asphalt Road Surface',
  'Damaged bituminous road patch excavated, compacted, and leveled with asphalt premix.',
  'सड़क के गड्ढे को डामर डालकर समतल कर दिया गया है।', 'hi',
  3, array['Asphalt leveling completed', 'Traffic flow restored safely'],
  array[]::text[], 'roads', 'resolved',
  60.0, 1, st_makepoint(77.6412, 12.9654)::geography,
  'HAL Old Airport Rd, Kodihalli, Bengaluru 560008', 'Ward 113 - Konena Agrahara',
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  now() - interval '3 days', now() - interval '2 days', 0.94, now() - interval '4 days', now() - interval '2 days'
),

-- 14. Water pipe replacement completed (Sev 4)
(
  'b5555555-5555-5555-5555-555555555555', 'NN-8W9R', 'water', 'pipe_leak',
  'Replaced 100mm Cast Iron Feeder Section',
  'Corroded pipe section excavated and replaced with new ductile iron pipe; pressure testing confirmed 0 leakage.',
  'ಕುಡಿಯುವ ನೀರಿನ ಹೊಸ ಪೈಪ್ ಅಳವಡಿಕೆ ಪೂರ್ಣಗೊಂಡಿದೆ.', 'kn',
  4, array['Full pipe section replaced', 'Road restoration handed over to PWD'],
  array[]::text[], 'water', 'resolved',
  80.0, 1, st_makepoint(77.5890, 12.9280)::geography,
  'South End Circle, Basavanagudi, Bengaluru 560004', 'Ward 154 - Basavanagudi',
  'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
  now() - interval '4 days', now() - interval '3 days', 0.97, now() - interval '5 days', now() - interval '3 days'
),

-- 15. Broken transformer fencing (Sev 5, Overdue)
(
  'b6666666-6666-6666-6666-666666666666', 'NN-3G6J', 'electrical', 'fallen_wire',
  'Exposed High Voltage Transformer Enclosure',
  'Vandalized chainlink fence exposing 11kV distribution transformer at sidewalk level. Urgent barrier needed.',
  'ट्रांसफार्मर की जाली टूटी हुई है, बच्चों के लिए बहुत खतरनाक है।', 'hi',
  5, array['Live 11kV busbars accessible from pavement', 'Overdue 12 hours'],
  array['electrical', 'near_school', 'children'], 'electrical', 'open',
  126.0, 4, st_makepoint(77.6150, 12.9300)::geography,
  'Koramangala 4th Block, Bengaluru 560034', 'Ward 151 - Koramangala',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
  now() - interval '12 hours', null, 0.98, now() - interval '1 day', now() - interval '2 hours'
),

-- 16. Noise and diesel generator emission (Sev 2)
(
  'b7777777-7777-7777-7777-777777777777', 'NN-2P1H', 'pollution', 'smoke_burning',
  'Unfiltered Commercial Generator Exhaust',
  'Continuous black soot emitting from uncertified commercial building backup generator.',
  'ജനറേറ്ററിൽ നിന്ന് കറുത്ത പുക വരുന്നു.', 'en',
  2, array['Exceeds permissible particulate standards'],
  array['health'], 'pollution', 'open',
  40.0, 1, st_makepoint(77.6255, 12.9802)::geography,
  'Old Madras Rd, Ulsoor, Bengaluru 560008', 'Ward 111 - Shantala Nagar',
  'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
  now() + interval '96 hours', null, 0.85, now() - interval '3 days', now() - interval '1 day'
),

-- 17. Desilting needed for stormwater inlet (Sev 2)
(
  'b8888888-8888-8888-8888-888888888888', 'NN-6U5T', 'drainage', 'sewage_overflow',
  'Leaves and Debris Blocking Drain Inflow',
  'Pre-monsoon maintenance required; roadside grating clogged with tree cuttings.',
  'ಮಳೆ ನೀರು ಹರಿಯುವ ಚರಂಡಿಯಲ್ಲಿ ಕಸ ತುಂಬಿದೆ.', 'kn',
  2, array['Restricted inlet area'],
  array[]::text[], 'drainage', 'in_progress',
  40.0, 1, st_makepoint(77.6520, 12.9730)::geography,
  '100 Feet Rd, Indiranagar, Bengaluru 560038', 'Ward 112 - Domlur',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  now() + interval '48 hours', null, 0.88, now() - interval '2 days', now() - interval '18 hours'
),

-- 18. Damaged speed breaker marker (Sev 2)
(
  'b9999999-9999-9999-9999-999999999999', 'NN-4S1F', 'roads', 'broken_footpath',
  'Faded Hump Markings and Loose Thermoplastic',
  'Speed breaker paint worn off, invisible at night causing abrupt braking.',
  'स्पीड ब्रेकर पर सफेद पट्टियां नहीं दिख रही हैं।', 'hi',
  2, array['Nighttime visibility hazard'],
  array['night_risk'], 'roads', 'acknowledged',
  40.0, 1, st_makepoint(77.5810, 12.9990)::geography,
  'Sankey Rd, Sadashivanagar, Bengaluru 560080', 'Ward 35 - Aramane Nagara',
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  now() + interval '120 hours', null, 0.91, now() - interval '2 days', now() - interval '1 day'
),

-- 19. Open construction debris dumping (Sev 3)
(
  'c1111111-1111-1111-1111-111111111111', 'NN-8D3G', 'sanitation', 'garbage_dump',
  'Illegal C&D Waste Concrete Blocks Dumped',
  'Truckload of masonry rubble dumped on roadside shoulder obstructing pedestrian lane.',
  'ರಸ್ತೆ ಬದಿಯಲ್ಲಿ ಕಟ್ಟಡ ತ್ಯಾಜ್ಯ ಸುರಿಯಲಾಗಿದೆ.', 'kn',
  3, array['Obstruction of road shoulder'],
  array['traffic_risk'], 'sanitation', 'open',
  60.0, 1, st_makepoint(77.6890, 12.9250)::geography,
  'Sarjapur Main Rd, Bellandur, Bengaluru 560103', 'Ward 150 - Bellandur',
  'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
  now() + interval '30 hours', null, 0.86, now() - interval '1 day', now() - interval '12 hours'
),

-- 20. Sparking junction box (Sev 4)
(
  'c2222222-2222-2222-2222-222222222222', 'NN-1Z9K', 'electrical', 'streetlight_out',
  'Intermittent Sparks From Streetlight Feeder Pillar',
  'Audible hum and sparks from open roadside metal control box when streetlights turn on.',
  'बिजली के खंभे के बॉक्स से चिंगारियां और आवाज आ रही है।', 'hi',
  4, array['Electrical fire risk', 'Water ingress risk during rain'],
  array['electrical', 'night_risk'], 'electrical', 'open',
  80.0, 1, st_makepoint(77.5920, 12.9550)::geography,
  'Lalbagh Fort Rd, Doddamavalli, Bengaluru 560004', 'Ward 143 - Vishveshwara Puram',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
  now() + interval '6 hours', null, 0.93, now() - interval '6 hours', now() - interval '2 hours'
),

-- 21. Water valve chamber cover missing (Sev 4)
(
  'c3333333-3333-3333-3333-333333333333', 'NN-7M4P', 'water', 'open_manhole',
  'Missing Metal Lid on Sluice Valve Chamber',
  'Water control chamber left open in middle of cyclist lane on Outer Ring Road.',
  'ಬೈಸಿಕಲ್ ಲೇನ್‌ನಲ್ಲಿ ವಾಲ್ವ್ ಚೇಂಬರ್ ಕವರ್ ಇಲ್ಲದೆ ತೆರೆದಿದೆ.', 'kn',
  4, array['Direct wheel trap for cyclists and scooters'],
  array['traffic_risk', 'night_risk'], 'water', 'in_progress',
  80.0, 1, st_makepoint(77.6820, 12.9600)::geography,
  'Marathahalli - Sarjapur Outer Ring Rd, Kadubeesanahalli, Bengaluru 560103', 'Ward 150 - Bellandur',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  now() + interval '8 hours', null, 0.92, now() - interval '4 hours', now() - interval '1 hour'
),

-- 22. Overflowing public dustbins near bus terminus (Sev 3)
(
  'c4444444-4444-4444-4444-444444444444', 'NN-5A2R', 'sanitation', 'garbage_dump',
  'Three BMTC Bus Shelter Litter Bins Full',
  'Waste overflowing on sidewalk attracting stray dogs and cattle at peak morning commute.',
  'बस स्टॉप के पास कचरे के डिब्बे पूरी तरह भर चुके हैं।', 'hi',
  3, array['Nuisance in high transit zone'],
  array['health'], 'sanitation', 'acknowledged',
  66.0, 2, st_makepoint(77.6060, 12.9730)::geography,
  'Brigade Rd, Shanthala Nagar, Ashok Nagar, Bengaluru 560001', 'Ward 111 - Shantala Nagar',
  'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
  now() + interval '24 hours', null, 0.89, now() - interval '18 hours', now() - interval '4 hours'
),

-- 23. Minor road erosion near curb (Sev 1)
(
  'c5555555-5555-5555-5555-555555555555', 'NN-9V8T', 'roads', 'broken_footpath',
  'Minor Asphalt Edge Cracking Near Storm Curb',
  'Hairline asphalt cracks along 2 meters of curbline with no immediate traffic obstruction.',
  'ಸಣ್ಣ ಬಿರುಕು ಕಾಣಿಸಿಕೊಂಡಿದೆ.', 'kn',
  1, array['Cosmetic road surface aging'],
  array[]::text[], 'roads', 'open',
  20.0, 1, st_makepoint(77.6320, 13.0010)::geography,
  'Banaswadi Main Rd, Cooke Town, Bengaluru 560005', 'Ward 88 - Maruthi Seva Nagar',
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  now() + interval '250 hours', null, 0.81, now() - interval '4 days', now() - interval '2 days'
),

-- 24. Citizen services manual triage request (Sev 2)
(
  'c6666666-6666-6666-6666-666666666666', 'NN-3X5Q', 'other', 'other',
  'Overhanging Dried Tree Branch Across Road',
  'Dead eucalyptus limb hanging precariously over municipal lane; needs forestry wing prune.',
  'सूखी भारी पेड़ की डाली सड़क पर गिरने वाली है।', 'hi',
  2, array['Risk of branch fall in high wind'],
  array['traffic_risk'], 'other', 'open',
  40.0, 1, st_makepoint(77.5680, 12.9430)::geography,
  'Bull Temple Rd, Kempegowda Nagar, Bengaluru 560019', 'Ward 154 - Basavanagudi',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  now() + interval '140 hours', null, 0.79, now() - interval '2 days', now() - interval '1 day'
),

-- 25. Resolved streetlight fixture replacement (Sev 3)
(
  'c7777777-7777-7777-7777-777777777777', 'NN-1E9D', 'electrical', 'streetlight_out',
  'Flickering 70W LED Street Luminaire Replaced',
  'Faulty LED driver unit replaced; luminaire tested and fully operational.',
  'ಬೀದಿ ದೀಪ ದುರಸ್ತಿ ಕಾರ್ಯ ಪೂರ್ಣಗೊಂಡಿದೆ.', 'kn',
  3, array['Driver PCB replaced and verified operational'],
  array[]::text[], 'electrical', 'resolved',
  60.0, 1, st_makepoint(77.5840, 12.9850)::geography,
  'Palace Rd, Vasanth Nagar, Bengaluru 560051', 'Ward 93 - Vasanth Nagar',
  'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
  now() - interval '5 days', now() - interval '4 days', 0.94, now() - interval '6 days', now() - interval '4 days'
);

-- Seed Status Events for History & Timeline
insert into status_events (complaint_id, status, note, image_url, actor, created_at) values
-- For complaint 12 (resolved market dump)
('b3333333-3333-3333-3333-333333333333', 'open', 'Citizen submitted report with photo', null, 'citizen', now() - interval '3 days'),
('b3333333-3333-3333-3333-333333333333', 'acknowledged', 'Dispatched sanitation squad #4', null, 'officer', now() - interval '2 days 18 hours'),
('b3333333-3333-3333-3333-333333333333', 'in_progress', 'Compactor truck loaded 2.5 tonnes waste', null, 'officer', now() - interval '2 days'),
('b3333333-3333-3333-3333-333333333333', 'resolved', 'Site cleared and bleached. Cleanliness verified.', 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80', 'officer', now() - interval '1 day'),

-- For complaint 13 (resolved pothole)
('b4444444-4444-4444-4444-444444444444', 'open', 'Reported via voice note', null, 'citizen', now() - interval '4 days'),
('b4444444-4444-4444-4444-444444444444', 'in_progress', 'Road patch work scheduled with cold mix asphalt', null, 'officer', now() - interval '3 days'),
('b4444444-4444-4444-4444-444444444444', 'resolved', 'Pothole filled and rolled. Smooth riding surface restored.', 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80', 'officer', now() - interval '2 days'),

-- For complaint 14 (resolved water pipe)
('b5555555-5555-5555-5555-555555555555', 'open', 'High pressure leakage reported', null, 'citizen', now() - interval '5 days'),
('b5555555-5555-5555-5555-555555555555', 'in_progress', 'Emergency valve turned off; trench excavated', null, 'officer', now() - interval '4 days'),
('b5555555-5555-5555-5555-555555555555', 'resolved', 'New ductile iron pipe installed and tested at 6 bar pressure.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'officer', now() - interval '3 days'),

-- For complaint 1 (active open manhole)
('a1111111-1111-1111-1111-111111111111', 'open', 'Initial photo report logged', null, 'citizen', now() - interval '2 hours'),
('a1111111-1111-1111-1111-111111111111', 'open', 'Duplicate citizen report merged (+1 upvote)', null, 'citizen', now() - interval '1 hour'),
('a1111111-1111-1111-1111-111111111111', 'open', 'Third citizen report merged (+1 upvote, priority recalculated)', null, 'citizen', now() - interval '20 minutes');
