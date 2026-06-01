const photos = (folder, count = 5) =>
  Array.from({ length: count }, (_, i) => `/images/projects/${folder}/photo${i + 1}.jpg`);

export const projectCategories = [
  {
    id: "utility",
    label: "Utility Scale Ground Mounted",
    badge: "Above 10 MW",
    color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    projects: [
      {
        id: "utl-1",
        title: "4.77 MW Grid-Connected Solar Plant",
        location: "North Central Province, Sri Lanka",
        acCapacity: "4.77 MW",
        dcCapacity: "5.20 MWp",
        client: "Private Developer",
        details:
          "33 kV grid-connected ground-mounted PV plant with central inverter system. Includes SCADA monitoring, protection relay coordination, 33 kV overhead line connection and full civil and structural works.",
        photos: photos("utility"),
      },
    ],
  },
  {
    id: "large-commercial",
    label: "Large Scale Commercial Rooftop",
    badge: "1 MW – 10 MW",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    projects: [
      {
        id: "lc-1",
        title: "Industrial Rooftop Solar System",
        location: "Western Province, Sri Lanka",
        acCapacity: "2.0 MW",
        dcCapacity: "2.5 MWp",
        client: "Manufacturing Company",
        details:
          "Large factory rooftop PV system with multiple string inverters. Designed for daytime electricity cost reduction with full protection coordination and energy monitoring.",
        photos: photos("large-commercial"),
      },
    ],
  },
  {
    id: "medium-rooftop",
    label: "Medium Range Rooftop Solar",
    badge: "100 kW – 1 MW",
    color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    projects: [
      {
        id: "mr-1",
        title: "Hotel Rooftop Solar System",
        location: "Southern Province, Sri Lanka",
        acCapacity: "500 kW",
        dcCapacity: "570 kWp",
        client: "Hotel Group",
        details:
          "500 kW grid-tied rooftop PV system for a large hotel. CEB net-metering compliant with energy monitoring dashboard and remote diagnostics.",
        photos: photos("medium-rooftop"),
      },
    ],
  },
  {
    id: "commercial",
    label: "Commercial Rooftop Solar",
    badge: "5 kW – 100 kW",
    color: "text-ecoGold bg-ecoGold/10 border-ecoGold/20",
    projects: [
      {
        id: "com-1",
        title: "Commercial Building Rooftop Solar",
        location: "Colombo, Sri Lanka",
        acCapacity: "75 kW",
        dcCapacity: "90 kWp",
        client: "Retail Business",
        details:
          "75 kW rooftop solar system for a commercial building in Colombo. String inverter system with CEB net-metering connection and real-time monitoring.",
        photos: photos("commercial"),
      },
    ],
  },
  {
    id: "domestic",
    label: "Domestic Rooftop Solar",
    badge: "5 kW – 40 kW",
    color: "text-green-400 bg-green-500/10 border-green-500/20",
    projects: [
      {
        id: "dom-1",
        title: "Residential Solar Installation",
        location: "Kandy, Sri Lanka",
        acCapacity: "10 kW",
        dcCapacity: "12 kWp",
        client: "Private Residence",
        details:
          "10 kW residential rooftop solar with CEB net-metering. Mono-crystalline panels, single-phase inverter and mobile app monitoring for homeowner.",
        photos: photos("domestic"),
      },
    ],
  },
  {
    id: "hybrid-domestic",
    label: "Hybrid Domestic Solar + BESS",
    badge: "5 kW – 20 kW + Battery",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    projects: [
      {
        id: "hd-1",
        title: "Home Hybrid Solar with Battery Storage",
        location: "Gampaha, Sri Lanka",
        acCapacity: "10 kW",
        dcCapacity: "12 kWp",
        client: "Private Residence",
        details:
          "10 kW hybrid solar system with 10 kWh LiFePO₄ battery storage. Seamless backup during outages, maximises solar self-consumption and reduces evening grid import.",
        photos: photos("hybrid-domestic"),
      },
    ],
  },
  {
    id: "commercial-bess",
    label: "Commercial BESS & Hybrid Rooftop",
    badge: "Commercial Scale",
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    projects: [
      {
        id: "cb-1",
        title: "Commercial Solar + Battery Storage System",
        location: "Colombo, Sri Lanka",
        acCapacity: "100 kW",
        dcCapacity: "120 kWp",
        client: "Commercial Client",
        details:
          "100 kW hybrid rooftop solar with 200 kWh commercial battery storage. Peak shaving, demand management and backup power for a commercial facility.",
        photos: photos("commercial-bess"),
      },
    ],
  },
  {
    id: "mini-grid",
    label: "Mini Grid Solar Project",
    badge: "Off-Grid / Hybrid",
    color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    projects: [
      {
        id: "mg-1",
        title: "Rural Community Mini Grid",
        location: "Dry Zone, Sri Lanka",
        acCapacity: "200 kW",
        dcCapacity: "250 kWp",
        client: "Community Project",
        details:
          "Off-grid mini solar power grid for a remote rural community. Battery storage for 24-hour supply and diesel generator backup for critical load management.",
        photos: photos("mini-grid"),
      },
    ],
  },
];
