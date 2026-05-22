window.First100DaysMetricsData = {
  "summary": {
    "title": "First 100 Days",
    "eyebrow": "Track the promises. Measure the progress.",
    "description": "Real-time updates on the commitments made and the results being delivered for Orange.",
    "startDate": "2025-04-01",
    "totalDays": 100,
    "daysElapsed": 47,
    "overallProgress": 42,
    "completedKeyActions": 21,
    "totalKeyActions": 50,
    "commitmentsTracked": 7,
    "statusBreakdown": [
      { "status": "Completed", "percent": 21 },
      { "status": "In Progress", "percent": 42 },
      { "status": "Planned", "percent": 21 },
      { "status": "Not Started", "percent": 16 }
    ]
  },
  "commitments": [
    {
      "id": "term-limits",
      "priority": 1,
      "title": "Term Limits",
      "description": "Propose and pass a city charter amendment to establish term limits for Council.",
      "status": "Completed",
      "progress": 100,
      "lastUpdateDate": "2025-05-12",
      "lastUpdate": "Public hearing scheduled for June 10.",
      "nextStep": "Community hearing and Council discussion.",
      "documents": []
    },
    {
      "id": "november-elections",
      "priority": 2,
      "title": "Move Elections to November",
      "description": "Align municipal elections with state elections to increase voter turnout.",
      "status": "In Progress",
      "progress": 60,
      "lastUpdateDate": "2025-05-05",
      "lastUpdate": "Resolution introduced for Council consideration.",
      "nextStep": "Council vote on resolution scheduled for June 3.",
      "documents": []
    },
    {
      "id": "parking-standards",
      "priority": 3,
      "title": "Better Parking Standards for New Developments",
      "description": "Update zoning code to require adequate, sensible parking for new projects.",
      "status": "In Progress",
      "progress": 50,
      "lastUpdateDate": "2025-04-28",
      "lastUpdate": "Draft code language complete.",
      "nextStep": "Planning Commission review in June.",
      "documents": []
    },
    {
      "id": "public-comment",
      "priority": 4,
      "title": "Restore 5-Minute Public Comment",
      "description": "Protect and restore residents' right to be heard.",
      "status": "In Progress",
      "progress": 40,
      "lastUpdateDate": "2025-04-15",
      "lastUpdate": "Council approved process update.",
      "nextStep": "Implementation complete. Monitoring ongoing.",
      "documents": []
    },
    {
      "id": "responsible-budgeting",
      "priority": 5,
      "title": "Stabilize Taxes Through Responsible Budgeting",
      "description": "Hold the line on taxes with disciplined spending and long-term planning.",
      "status": "In Progress",
      "progress": 35,
      "lastUpdateDate": "2025-05-01",
      "lastUpdate": "FY 2025-26 budget workshops underway.",
      "nextStep": "Present proposed budget in June.",
      "documents": []
    },
    {
      "id": "scotland-road",
      "priority": 6,
      "title": "Create a Scotland Road Business Improvement District",
      "description": "Empower local businesses and invest in safety, cleanliness, and activation.",
      "status": "Planned",
      "progress": 20,
      "lastUpdateDate": "2025-05-08",
      "lastUpdate": "Exploratory meetings with stakeholders held.",
      "nextStep": "Form advisory group and gather input.",
      "documents": []
    },
    {
      "id": "data-dashboards",
      "priority": 7,
      "title": "Launch Public Data Dashboards",
      "description": "Public dashboards for budgets, projects, and performance metrics.",
      "status": "Not Started",
      "progress": 0,
      "lastUpdateDate": "",
      "lastUpdate": "Planning phase.",
      "nextStep": "Define data roadmap and platform.",
      "documents": []
    }
  ]
};
window.dispatchEvent(new CustomEvent("first100days:data-ready", {
  detail: window.First100DaysMetricsData
}));
