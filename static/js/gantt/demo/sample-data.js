/**
 * Sample data for the Gantt scheduler demo
 * Uses relative dates so the demo always works regardless of system date
 */

// Get current date and create relative dates
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();

// Base date: 15 days ago from now
const baseTime = now.getTime() - (15 * 24 * 60 * 60 * 1000);
const getDate = (daysOffset) => baseTime + (daysOffset * 24 * 60 * 60 * 1000);

export const DEMO_DATA = {
  jobs: [
    // GNDC-S1 resource (y: 0)
    {
      id: "M-201",
      name: "M-201 Well Maintenance",
      scope: "Re Completion/Workover",
      team: "WRO",
      start: getDate(0),
      end: getDate(10),
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
      start: getDate(10),
      end: getDate(19),
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
      start: getDate(19),
      end: getDate(24),
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
      start: getDate(24),
      end: getDate(31),
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
      start: getDate(5),
      end: getDate(18),
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
      start: getDate(18),
      end: getDate(28),
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
      start: getDate(3),
      end: getDate(21),
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
      start: getDate(21),
      end: getDate(34),
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
      start: getDate(7),
      end: getDate(24),
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
      start: getDate(1),
      end: getDate(26),
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
      start: getDate(4),
      end: getDate(22),
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
      start: getDate(22),
      end: getDate(32),
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
      start: getDate(2),
      end: getDate(13),
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
      start: getDate(13),
      end: getDate(23),
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
      start: getDate(6),
      end: getDate(20),
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
      start: getDate(8),
      end: getDate(17),
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
      start: getDate(17),
      end: getDate(25),
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
      start: getDate(9),
      end: getDate(21),
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
      start: getDate(11),
      end: getDate(24),
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
  
  // View range: 20 days before base to 40 days after
  viewStart: baseTime - (5 * 24 * 60 * 60 * 1000),
  viewEnd: baseTime + (40 * 24 * 60 * 60 * 1000)
};
