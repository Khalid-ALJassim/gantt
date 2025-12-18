/**
 * Sample data for the Gantt scheduler demo
 * Data structure matches the reference implementation
 */

export const DEMO_DATA = {
  jobs: [
    // GNDC-S1 resource (y: 0)
    {
      id: "M-201",
      name: "M-201 Well Maintenance",
      scope: "Re Completion/Workover",
      team: "WRO",
      start: Date.UTC(2024, 11, 15), // Dec 15, 2024
      end: Date.UTC(2024, 11, 25),
      y: 0,
      color: "#5a8aa3",
      estGain: "150 BOPD",
      optMethod: "ESP",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "45",
      secondaryScope: ["ESP", "Tubing"]
    },
    {
      id: "S-112",
      name: "S-112 Well Service",
      scope: "Sidetrak/New Drilling",
      team: "WRO",
      start: Date.UTC(2024, 11, 25),
      end: Date.UTC(2025, 0, 3), // Jan 3, 2025
      y: 0,
      color: "#5a8aa3",
      estGain: "180 BOPD",
      optMethod: "Gas Lift",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "52",
      secondaryScope: ["Drilling", "Perforation"]
    },
    {
      id: "SP-45",
      name: "SP-45 Re-entry",
      scope: "Re Completion",
      team: "WRO",
      start: Date.UTC(2025, 0, 3),
      end: Date.UTC(2025, 0, 8),
      y: 0,
      color: "#5a8aa3",
      estGain: "120 BOPD",
      optMethod: "ESP",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "40",
      secondaryScope: ["ESP"]
    },
    {
      id: "W-113",
      name: "W-113 East Field",
      scope: "Re Completion/Workover",
      team: "WRO",
      start: Date.UTC(2025, 0, 8),
      end: Date.UTC(2025, 0, 15),
      y: 0,
      color: "#ff8787",
      estGain: "200 BOPD",
      optMethod: "ESP",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "50",
      secondaryScope: ["ESP", "Acid"]
    },

    // GNDC-S2 resource (y: 1)
    {
      id: "W-201",
      name: "W-201 North Area",
      scope: "Workover",
      team: "WRO",
      start: Date.UTC(2024, 11, 20),
      end: Date.UTC(2025, 0, 2),
      y: 1,
      color: "#7cb342",
      estGain: "175 BOPD",
      optMethod: "Gas Lift",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "48",
      secondaryScope: ["Gas Lift", "Tubing"]
    },
    {
      id: "M-78",
      name: "M-78 Maintenance",
      scope: "Re Completion",
      team: "WRO",
      start: Date.UTC(2025, 0, 2),
      end: Date.UTC(2025, 0, 12),
      y: 1,
      color: "#7cb342",
      estGain: "160 BOPD",
      optMethod: "ESP",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "46",
      secondaryScope: ["ESP", "Perforation"]
    },

    // GNDC-S3 resource (y: 2)
    {
      id: "S-203",
      name: "S-203 Sidetrak",
      scope: "Sidetrak/New Drilling",
      team: "WRO",
      start: Date.UTC(2024, 11, 18),
      end: Date.UTC(2025, 0, 5),
      y: 2,
      color: "#ff9800",
      estGain: "250 BOPD",
      optMethod: "ESP",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "60",
      secondaryScope: ["Drilling", "ESP"]
    },
    {
      id: "W-89",
      name: "W-89 West Field",
      scope: "Workover",
      team: "WRO",
      start: Date.UTC(2025, 0, 5),
      end: Date.UTC(2025, 0, 18),
      y: 2,
      color: "#ff9800",
      estGain: "190 BOPD",
      optMethod: "Gas Lift",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "51",
      secondaryScope: ["Gas Lift", "Acid"]
    },

    // GNDC-S4 resource (y: 3)
    {
      id: "M-156",
      name: "M-156 Service",
      scope: "Re Completion",
      team: "WRO",
      start: Date.UTC(2024, 11, 22),
      end: Date.UTC(2025, 0, 8),
      y: 3,
      color: "#9c27b0",
      estGain: "140 BOPD",
      optMethod: "ESP",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "42",
      secondaryScope: ["ESP", "Tubing"]
    },

    // GNDC-71 resource (y: 4)
    {
      id: "S-401",
      name: "S-401 New Well",
      scope: "Sidetrak/New Drilling",
      team: "WRO",
      start: Date.UTC(2024, 11, 16),
      end: Date.UTC(2025, 0, 10),
      y: 4,
      color: "#00acc1",
      estGain: "300 BOPD",
      optMethod: "ESP",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "70",
      secondaryScope: ["Drilling", "ESP", "Perforation"]
    },

    // GNDC-72 resource (y: 5)
    {
      id: "W-501",
      name: "W-501 Deep Zone",
      scope: "Workover",
      team: "WRO",
      start: Date.UTC(2024, 11, 19),
      end: Date.UTC(2025, 0, 6),
      y: 5,
      color: "#e91e63",
      estGain: "220 BOPD",
      optMethod: "Gas Lift",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "55",
      secondaryScope: ["Gas Lift", "Acid", "Perforation"]
    },
    {
      id: "M-602",
      name: "M-602 Intervention",
      scope: "Re Completion",
      team: "WRO",
      start: Date.UTC(2025, 0, 6),
      end: Date.UTC(2025, 0, 16),
      y: 5,
      color: "#e91e63",
      estGain: "170 BOPD",
      optMethod: "ESP",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "47",
      secondaryScope: ["ESP"]
    },

    // ST-60 resource (y: 6)
    {
      id: "ST-101",
      name: "ST-101 Stimulation",
      scope: "Stimulation/Acid",
      team: "STIM",
      start: Date.UTC(2024, 11, 17),
      end: Date.UTC(2024, 11, 28),
      y: 6,
      color: "#795548",
      estGain: "100 BOPD",
      optMethod: "Acid",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "35",
      secondaryScope: ["Acid"]
    },
    {
      id: "ST-102",
      name: "ST-102 Matrix",
      scope: "Stimulation/Acid",
      team: "STIM",
      start: Date.UTC(2024, 11, 28),
      end: Date.UTC(2025, 0, 7),
      y: 6,
      color: "#795548",
      estGain: "95 BOPD",
      optMethod: "Acid",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "32",
      secondaryScope: ["Acid", "Matrix"]
    },

    // ST-61 resource (y: 7)
    {
      id: "ST-201",
      name: "ST-201 Fracturing",
      scope: "Stimulation/Frac",
      team: "STIM",
      start: Date.UTC(2024, 11, 21),
      end: Date.UTC(2025, 0, 4),
      y: 7,
      color: "#607d8b",
      estGain: "180 BOPD",
      optMethod: "Frac",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "50",
      secondaryScope: ["Frac"]
    },

    // ST-62 resource (y: 8)
    {
      id: "ST-301",
      name: "ST-301 Acid Job",
      scope: "Stimulation/Acid",
      team: "STIM",
      start: Date.UTC(2024, 11, 23),
      end: Date.UTC(2025, 0, 1),
      y: 8,
      color: "#8bc34a",
      estGain: "85 BOPD",
      optMethod: "Acid",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "30",
      secondaryScope: ["Acid"]
    },
    {
      id: "ST-302",
      name: "ST-302 Treatment",
      scope: "Stimulation/Acid",
      team: "STIM",
      start: Date.UTC(2025, 0, 1),
      end: Date.UTC(2025, 0, 9),
      y: 8,
      color: "#8bc34a",
      estGain: "90 BOPD",
      optMethod: "Acid",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "31",
      secondaryScope: ["Acid", "Matrix"]
    },

    // ST-80 resource (y: 9)
    {
      id: "ST-401",
      name: "ST-401 Matrix Acid",
      scope: "Stimulation/Acid",
      team: "STIM",
      start: Date.UTC(2024, 11, 24),
      end: Date.UTC(2025, 0, 5),
      y: 9,
      color: "#3f51b5",
      estGain: "110 BOPD",
      optMethod: "Acid",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "38",
      secondaryScope: ["Acid", "Matrix"]
    },

    // ST-81 resource (y: 10)
    {
      id: "ST-501",
      name: "ST-501 Frac Job",
      scope: "Stimulation/Frac",
      team: "STIM",
      start: Date.UTC(2024, 11, 26),
      end: Date.UTC(2025, 0, 8),
      y: 10,
      color: "#ff5722",
      estGain: "200 BOPD",
      optMethod: "Frac",
      location: "Kuwait",
      locationIcon: "🌍",
      bopdRigHour: "52",
      secondaryScope: ["Frac", "Perforation"]
    }
  ],
  
  resources: [
    "GNDC-S1",
    "GNDC-S2",
    "GNDC-S3",
    "GNDC-S4",
    "GNDC-71",
    "GNDC-72",
    "ST-60",
    "ST-61",
    "ST-62",
    "ST-80",
    "ST-81"
  ],
  
  viewStart: Date.UTC(2024, 11, 10), // Dec 10, 2024
  viewEnd: Date.UTC(2025, 1, 1)      // Feb 1, 2025
};
