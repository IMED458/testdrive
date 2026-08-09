import {
  RouteVersion,
  ExamRuleSet,
  TechnicalQuestion,
  AudioAsset,
  RoadWarning,
  User,
  StudentProfile,
  InstructorProfile,
} from '../types';

/**
 * 1. OFFICIAL GEORGIA B CATEGORY DRIVING TEST RULESET (CONFIGURABLE)
 */
export const DEFAULT_GEORGIA_RULESET: ExamRuleSet = {
  id: 'ruleset-georgia-b-2026',
  name: 'საქართველოს B კატეგორიის პრაქტიკული გამოცდის ოფიციალური წესები',
  version: '2026-06',
  lightErrorFailThreshold: 10, // 10 or more light errors = FAIL
  seriousErrorFailThreshold: 1, // 1 serious error = FAIL
  disqualificationFailThreshold: 1, // 1 disqualifying error = IMMEDIATE FAIL
  activeFrom: '2026-06-01',
  rules: [
    // LIGHT ERRORS (მსუბუქი შეცდომები)
    {
      id: 'rule-light-01',
      code: 'OBS-01',
      nameKa: 'სარკეში უყურადღებობა / თვალის შეუვლება',
      category: 'Observation',
      severity: 'LIGHT',
      points: 1,
      descriptionKa: 'მანევრის დაწყებამდე უკანა და გვერდითა სარკეების დაუთვალიერებლობა',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-light-02',
      code: 'OBS-02',
      nameKa: 'მკვდარი ზონის შეუმჩნევლობა',
      category: 'Observation',
      severity: 'LIGHT',
      points: 1,
      descriptionKa: 'ზოლის შეცვლისას ან მოხვევისას თავის მიბრუნებით მკვდარი ზონის შეუმოწმებლობა',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-light-03',
      code: 'IND-01',
      nameKa: 'მოხვევის მაჩვენებლის (ციმციმას) დაგვიანებით ჩართვა',
      category: 'Indicators',
      severity: 'LIGHT',
      points: 1,
      descriptionKa: 'ციმციმას ჩართვა მანევრამდე მცირე მანძილზე, რამაც სხვა მძღოლები დააბნია',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-light-04',
      code: 'IND-02',
      nameKa: 'მოხვევის მაჩვენებლის გამორთვის დავიწყება',
      category: 'Indicators',
      severity: 'LIGHT',
      points: 1,
      descriptionKa: 'მანევრის დასრულების შემდეგ მოხვევის ციმციმას ჩართული დატოვება',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-light-05',
      code: 'SPD-01',
      nameKa: 'არათანაბარი ან ზედმეტად ნელი მოძრაობა',
      category: 'Speed',
      severity: 'LIGHT',
      points: 1,
      descriptionKa: 'უსაფუძვლოდ დაბალი სიჩქარით მოძრაობა, რამაც შექმნა საცობი',
      isAutomaticDetection: true,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-light-06',
      code: 'LNE-01',
      nameKa: 'სავალ ნაწილზე არაზუსტი განლაგება',
      category: 'LanePositioning',
      severity: 'LIGHT',
      points: 1,
      descriptionKa: 'ზოლის შუაში მოძრაობის ნაცვლად ზოლის გამყოფ ხაზთან ზედმეტად ახლოს მოძრაობა',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-light-07',
      code: 'CTL-01',
      nameKa: 'ძრავის ჩაქრობა (Stall) დაძვრისას',
      category: 'VehicleControl',
      severity: 'LIGHT',
      points: 1,
      descriptionKa: 'დაძვრისას ან მანევრისას ძრავის უნებლიე ჩაქრობა',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-light-08',
      code: 'CTL-02',
      nameKa: 'არასწორი გადაცემათა კოლოფის არჩევა',
      category: 'VehicleControl',
      severity: 'LIGHT',
      points: 1,
      descriptionKa: 'სიჩქარის შეუსაბამო სიჩქარეთა გადაცემაში მოძრაობა',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },

    // SERIOUS ERRORS (სერიოზული შეცდომები)
    {
      id: 'rule-serious-01',
      code: 'STP-01',
      nameKa: 'STOP ნიშანთან სრული გაჩერების იგნორირება',
      category: 'StopSign',
      severity: 'SERIOUS',
      points: 5,
      descriptionKa: 'STOP (სავალდებულო გაჩერება) ნიშანთან თვლების სრულად არ გაჩერება',
      isAutomaticDetection: true,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-serious-02',
      code: 'IND-03',
      nameKa: 'მოხვევის მაჩვენებლის სრული არჩართვა',
      category: 'Indicators',
      severity: 'SERIOUS',
      points: 5,
      descriptionKa: 'მანევრის, ზოლის შეცვლის ან მოხვევის შესრულება ციმციმას ჩართვის გარეშე',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-serious-03',
      code: 'PRY-01',
      nameKa: 'უპირატესობის არდათმობა (Priority violation)',
      category: 'Priority',
      severity: 'SERIOUS',
      points: 5,
      descriptionKa: 'მთავარ გზაზე მოძრავი სატრანსპორტო საშუალებისთვის გზის დაუთმობლობა',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-serious-04',
      code: 'PED-01',
      nameKa: 'ქვეითთა გადასასვლელზე ქვეითისთვის გზის არდათმობა',
      category: 'Pedestrian',
      severity: 'SERIOUS',
      points: 5,
      descriptionKa: 'ქვეითთა გადასასვლელზე მიახლოებულ ან გადამსვლელ ქვეითთან უპირატესობის დარღვევა',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-serious-05',
      code: 'SPD-02',
      nameKa: 'დადგენილი სიჩქარის გადაჭარბება (10 კმ/სთ-მდე)',
      category: 'Speed',
      severity: 'SERIOUS',
      points: 5,
      descriptionKa: 'საგზაო ნიშნით ან ზონით დადგენილი მაქსიმალური სიჩქარის გადაჭარბება',
      isAutomaticDetection: true,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-serious-06',
      code: 'LNE-02',
      nameKa: 'ღერძულა უწყვეტი ხაზის გადაკვეთა',
      category: 'LanePositioning',
      severity: 'SERIOUS',
      points: 5,
      descriptionKa: 'გზის სავალი ნაწილის გამყოფი უწყვეტი ხაზის გადაკვეთა',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },

    // DISQUALIFYING ERRORS (დისკვალიფიკაცია / დაუყოვნებლივი ჩაჭრა)
    {
      id: 'rule-disq-01',
      code: 'DSQ-01',
      nameKa: 'წითელ შუქნიშანზე გავლით მოძრაობის გაგრძელება',
      category: 'TrafficSignal',
      severity: 'DISQUALIFYING',
      points: 10,
      descriptionKa: 'შუქნიშნის აკრძალულ წითელ ან ყვითელ სიგნალზე გავლით მოძრაობა',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-disq-02',
      code: 'DSQ-02',
      nameKa: 'საგზაო სატრანსპორტო შემთხვევის (ავარიის) საფრთხის შექმნა',
      category: 'SafetyCritical',
      severity: 'DISQUALIFYING',
      points: 10,
      descriptionKa: 'გამომცდელის ან ინსტრუქტორის ჩარევა საჭის ან მუხრუჭის მართვაში ავარიის ასაცილებლად',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },
    {
      id: 'rule-disq-03',
      code: 'DSQ-03',
      nameKa: 'საწინააღმდეგო მოძრაობის ზოლში შესვლა',
      category: 'LanePositioning',
      severity: 'DISQUALIFYING',
      points: 10,
      descriptionKa: 'უსაფრთხოების დარღვევით საწინააღმდეგო ზოლში შესვლა',
      isAutomaticDetection: false,
      isInstructorEvaluated: true,
    },
  ],
};

/**
 * 2. TELAVI OFFICIAL TEST ROUTES DATASET (MVP)
 * Start Location: Telavi Service Agency (თელავის მომსახურების სააგენტო) lat: 41.9215, lng: 45.4782
 */
export const TELAVI_ROUTES: RouteVersion[] = [
  {
    id: 'telavi-route-1-v2026',
    city: 'Telavi',
    routeNumber: 1,
    category: 'B',
    versionDate: '2026-07-22',
    validFrom: '2026-07-22',
    validUntil: null,
    status: 'ACTIVE',
    officialSourceUrl: 'https://matsne.gov.ge/ka/document/view/6948586',
    lastVerifiedDate: '2026-08-08',
    startPoint: { lat: 41.9215, lng: 45.4782 },
    finishPoint: { lat: 41.9218, lng: 45.4785 },
    polyline: [
      { lat: 41.9215, lng: 45.4782 }, // სააგენტოს გამოსასვლელი
      { lat: 41.9208, lng: 45.4771 }, // ალაზნის გამზირი
      { lat: 41.9195, lng: 45.4752 }, // ალაზნის გამზირის კვეთა
      { lat: 41.9182, lng: 45.4735 }, // ილია ილია ჭავჭავაძის გამზირი
      { lat: 41.9171, lng: 45.4718 }, // გზაჯვარედინი (გადაუმოწმებელი)
      { lat: 41.9160, lng: 45.4705 }, // რუსთაველის ქუჩა
      { lat: 41.9152, lng: 45.4691 }, // ერეკლე II-ის ქუჩა
      { lat: 41.9160, lng: 45.4705 }, // უკან მობრუნება
      { lat: 41.9171, lng: 45.4718 },
      { lat: 41.9208, lng: 45.4771 },
      { lat: 41.9218, lng: 45.4785 }, // დაბრუნება სააგენტოში
    ],
    instructions: [
      {
        id: 'tel-r1-i1',
        order: 1,
        location: { lat: 41.9212, lng: 45.4778 },
        triggerRadiusMeters: 25,
        instructionText: 'გამოსვლიდან 50 მეტრში იმოძრავეთ პირდაპირ ალაზნის გამზირის მიმართულებით.',
        audioKey: 'START_EXAM',
        maneuverType: 'START_MOVEMENT',
        speedLimit: 40,
      },
      {
        id: 'tel-r1-i2',
        order: 2,
        location: { lat: 41.9200, lng: 45.4760 },
        triggerRadiusMeters: 30,
        instructionText: 'შემდეგ გზაჯვარედინზე შეასრულეთ მარცხნივ მოხვევა ილია ჭავჭავაძის გამზირზე.',
        audioKey: 'TURN_LEFT',
        maneuverType: 'LEFT_TURN',
        hazardNote: 'დაუთმეთ საწინააღმდეგოდ მომავალ ტრანსპორტს!',
      },
      {
        id: 'tel-r1-i3',
        order: 3,
        location: { lat: 41.9175, lng: 45.4722 },
        triggerRadiusMeters: 30,
        instructionText: 'წრიულ მოძრაობაზე შედით მარჯვენა ზოლიდან და გაჰყევით მეორე გამოსასვლელს.',
        audioKey: 'ROUNDABOUT',
        maneuverType: 'ROUNDABOUT',
        speedLimit: 30,
      },
      {
        id: 'tel-r1-i4',
        order: 4,
        location: { lat: 41.9155, lng: 45.4698 },
        triggerRadiusMeters: 25,
        instructionText: 'STOP ნიშანთან შეასრულეთ სრული გაჩერება და შეამოწმეთ გზაჯვარედინი.',
        audioKey: 'STOP_SIGN',
        maneuverType: 'STOP_SIGN',
        hazardNote: 'აუცილებელია თვლების სრული გაჩერება!',
      },
      {
        id: 'tel-r1-i5',
        order: 5,
        location: { lat: 41.9215, lng: 45.4782 },
        triggerRadiusMeters: 20,
        instructionText: 'შეასრულეთ უსაფრთხო პარკირება და დაასრულეთ გამოცდა.',
        audioKey: 'PULL_OVER_SAFE',
        maneuverType: 'PARKING',
      },
    ],
    checkpoints: [
      {
        id: 'tel-r1-cp1',
        name: 'ალაზნის გამზირის კვეთა',
        location: { lat: 41.9195, lng: 45.4752 },
        radiusMeters: 15,
        maneuverType: 'LEFT_TURN',
      },
      {
        id: 'tel-r1-cp2',
        name: 'STOP ნიშანი (მდებარეობა გადასამოწმებელია)',
        location: { lat: 41.9155, lng: 45.4698 },
        radiusMeters: 10,
        requiredStopMeters: 3,
        minStationarySeconds: 2,
        maneuverType: 'STOP_SIGN',
      },
    ],
    speedZones: [
      {
        name: 'ალაზნის გამზირი',
        polyline: [
          { lat: 41.9215, lng: 45.4782 },
          { lat: 41.9195, lng: 45.4752 },
        ],
        speedLimit: 40,
      },
      {
        name: 'ცენტრალური ზონა',
        polyline: [
          { lat: 41.9182, lng: 45.4735 },
          { lat: 41.9152, lng: 45.4691 },
        ],
        speedLimit: 30,
      },
    ],
    hazardNotes: [
      'ალაზნის გამზირზე ხშირია ქვეითთა მოულოდნელი გადასვლა.',
      'წრიულ მოძრაობაზე დაიცავით ზოლში განლაგება.',
    ],
    officialStreets: [
      { nameKa: 'ალაზნის გამზირი', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'ვაზიანი-გომბორი-თელავის გზატკეცილი', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'ვანო სარაჯიშვილის ქუჩა', trust: 'PENDING_REVIEW' },
      { nameKa: 'ილია ჭავჭავაძის გამზირი', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'თეთრიანის ქუჩა', trust: 'MANUALLY_VERIFIED' },
      { nameKa: 'ერეკლე II-ის ქუჩა', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'რუსთაველის ქუჩა', trust: 'OFFICIAL_DOCUMENT' },
    ],
    officialMapAsset: 'telavi_route_1_official.png',
    sourceDocument: '№598 ბრძანებით დამტკიცებული საგამოცდო მარშრუტები',
    trust: {
      officialMap: 'OFFICIAL_DOCUMENT',
      polyline: 'ESTIMATED',
      streetNames: 'MANUALLY_VERIFIED',
      startPoint: 'ESTIMATED',
    },
    geometryNoteKa:
      'ოფიციალური წყარო არის რასტრული რუკა და არა GPS-მონაცემი. მარშრუტის ხაზი სავარჯიშო მიახლოებაა, ადგილზე გადამოწმებული არ არის — რეალურ გამოცდაზე ყოველთვის იხელმძღვანელე გამომცდელის მითითებით და საგზაო ნიშნებით.',
  },
  {
    id: 'telavi-route-2-v2026',
    city: 'Telavi',
    routeNumber: 2,
    category: 'B',
    versionDate: '2026-07-22',
    validFrom: '2026-07-22',
    validUntil: null,
    status: 'TEMPORARILY_AFFECTED',
    officialSourceUrl: 'https://matsne.gov.ge/ka/document/view/6948586',
    lastVerifiedDate: '2026-08-08',
    startPoint: { lat: 41.9215, lng: 45.4782 },
    finishPoint: { lat: 41.9218, lng: 45.4785 },
    polyline: [
      { lat: 41.9215, lng: 45.4782 },
      { lat: 41.9225, lng: 45.4800 }, // თეთრიანის ქუჩა
      { lat: 41.9240, lng: 45.4820 }, // ილია ჭავჭავაძის გამზირი
      { lat: 41.9255, lng: 45.4840 }, // დავით აღმაშენებლის ქუჩა
      { lat: 41.9240, lng: 45.4820 },
      { lat: 41.9218, lng: 45.4785 },
    ],
    instructions: [
      {
        id: 'tel-r2-i1',
        order: 1,
        location: { lat: 41.9218, lng: 45.4788 },
        triggerRadiusMeters: 25,
        instructionText: 'გამოსვლისას შეასრულეთ მარჯვნივ მოხვევა თეთრიანის ქუჩისკენ.',
        audioKey: 'TURN_RIGHT',
        maneuverType: 'RIGHT_TURN',
      },
      {
        id: 'tel-r2-i2',
        order: 2,
        location: { lat: 41.9232, lng: 45.4810 },
        triggerRadiusMeters: 25,
        instructionText: 'შეასრულეთ ზოლის შეცვლა მარცხნივ უსაფრთხო მანძილის დაცვით.',
        audioKey: 'CHANGE_LANE_LEFT',
        maneuverType: 'LANE_CHANGE_LEFT',
      },
      {
        id: 'tel-r2-i3',
        order: 3,
        location: { lat: 41.9250, lng: 45.4835 },
        triggerRadiusMeters: 25,
        instructionText: 'შემდეგ გზაჯვარედინზე შეასრულეთ უკან მობრუნება (U-turn).',
        audioKey: 'U_TURN',
        maneuverType: 'U_TURN',
      },
    ],
    checkpoints: [
      {
        id: 'tel-r2-cp1',
        name: 'ჭავჭავაძის კვეთა',
        location: { lat: 41.9240, lng: 45.4820 },
        radiusMeters: 15,
        maneuverType: 'INTERSECTION',
      },
    ],
    speedZones: [{ name: 'ილია ჭავჭავაძის გამზირი', polyline: [], speedLimit: 40 }],
    hazardNotes: ['ყურადღება: ჭავჭავაძის გამზირზე მიმდინარეობს საგზაო სამუშაოები!'],
    officialStreets: [
      { nameKa: 'ალაზნის გამზირი', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'ვაზიანი-გომბორი-თელავის გზატკეცილი', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'ილია ჭავჭავაძის გამზირი', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'თეთრიანის ქუჩა', trust: 'MANUALLY_VERIFIED' },
      { nameKa: 'დავით აღმაშენებლის ქუჩა', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'რუსთაველის ქუჩა', trust: 'OFFICIAL_DOCUMENT' },
    ],
    officialMapAsset: 'telavi_route_2_official.png',
    sourceDocument: '№598 ბრძანებით დამტკიცებული საგამოცდო მარშრუტები',
    trust: {
      officialMap: 'OFFICIAL_DOCUMENT',
      polyline: 'ESTIMATED',
      streetNames: 'MANUALLY_VERIFIED',
      startPoint: 'ESTIMATED',
    },
    geometryNoteKa:
      'ოფიციალური წყარო არის რასტრული რუკა და არა GPS-მონაცემი. მარშრუტის ხაზი სავარჯიშო მიახლოებაა, ადგილზე გადამოწმებული არ არის — რეალურ გამოცდაზე ყოველთვის იხელმძღვანელე გამომცდელის მითითებით და საგზაო ნიშნებით.',
  },
  {
    id: 'telavi-route-3-v2026',
    city: 'Telavi',
    routeNumber: 3,
    category: 'B',
    versionDate: '2026-07-22',
    validFrom: '2026-07-22',
    validUntil: null,
    status: 'ACTIVE',
    officialSourceUrl: 'https://matsne.gov.ge/ka/document/view/6948586',
    lastVerifiedDate: '2026-08-08',
    startPoint: { lat: 41.9215, lng: 45.4782 },
    finishPoint: { lat: 41.9218, lng: 45.4785 },
    polyline: [
      { lat: 41.9215, lng: 45.4782 },
      { lat: 41.9200, lng: 45.4760 },
      { lat: 41.9190, lng: 45.4740 },
      { lat: 41.9218, lng: 45.4785 },
    ],
    instructions: [
      {
        id: 'tel-r3-i1',
        order: 1,
        location: { lat: 41.9210, lng: 45.4775 },
        triggerRadiusMeters: 25,
        instructionText: 'იმოძრავეთ პირდაპირ დასახლებული პუნქტის სიჩქარის ლიმიტის დაცვით.',
        audioKey: 'CONTINUE_STRAIGHT',
        maneuverType: 'GENERAL_OBSERVATION',
      },
      {
        id: 'tel-r3-i2',
        order: 2,
        location: { lat: 41.9195, lng: 45.4748 },
        triggerRadiusMeters: 25,
        instructionText: 'აღმართზე შეჩერებისას შეასრულეთ უსაფრთხო დაძვრა უკუგორების გარეშე.',
        audioKey: 'HILL_START',
        maneuverType: 'HILL_START',
      },
    ],
    checkpoints: [],
    speedZones: [],
    hazardNotes: [],
    officialStreets: [
      { nameKa: 'ალაზნის გამზირი', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'ვაზიანი-გომბორი-თელავის გზატკეცილი', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'ილია ჭავჭავაძის გამზირი', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'დავით აღმაშენებლის ქუჩა', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'კურდღელაურის ქუჩა', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'რუსთაველის ქუჩა', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'თბილისის გზატკეცილი', trust: 'OFFICIAL_DOCUMENT' },
    ],
    officialMapAsset: 'telavi_route_3_official.png',
    sourceDocument: '№598 ბრძანებით დამტკიცებული საგამოცდო მარშრუტები',
    trust: {
      officialMap: 'OFFICIAL_DOCUMENT',
      polyline: 'ESTIMATED',
      streetNames: 'PENDING_REVIEW',
      startPoint: 'ESTIMATED',
    },
    geometryNoteKa:
      'ოფიციალური წყარო არის რასტრული რუკა და არა GPS-მონაცემი. მარშრუტის ხაზი სავარჯიშო მიახლოებაა, ადგილზე გადამოწმებული არ არის — რეალურ გამოცდაზე ყოველთვის იხელმძღვანელე გამომცდელის მითითებით და საგზაო ნიშნებით.',
    // წყაროს შენიშვნა: ოფიციალურ რასტრულ რუკაზე ერთი აღმოსავლეთის შემაერთებელი ქუჩის წარწერა არასაკმარისად მკაფიოა.
  },
  {
    id: 'telavi-route-4-v2026',
    city: 'Telavi',
    routeNumber: 4,
    category: 'B',
    versionDate: '2026-07-22',
    validFrom: '2026-07-22',
    validUntil: null,
    status: 'ACTIVE',
    officialSourceUrl: 'https://matsne.gov.ge/ka/document/view/6948586',
    lastVerifiedDate: '2026-08-08',
    startPoint: { lat: 41.9215, lng: 45.4782 },
    finishPoint: { lat: 41.9218, lng: 45.4785 },
    polyline: [
      { lat: 41.9215, lng: 45.4782 },
      { lat: 41.9205, lng: 45.4765 },
      { lat: 41.9218, lng: 45.4785 },
    ],
    instructions: [
      {
        id: 'tel-r4-i1',
        order: 1,
        location: { lat: 41.9210, lng: 45.4772 },
        triggerRadiusMeters: 25,
        instructionText: 'ქვეითთა გადასასვლელთან შეამცირეთ სიჩქარე და დააკვირდით უსაფრთხოებას.',
        audioKey: 'PEDESTRIAN_CROSSING',
        maneuverType: 'PEDESTRIAN_CROSSING',
      },
    ],
    checkpoints: [],
    speedZones: [],
    hazardNotes: [],
    officialStreets: [
      { nameKa: 'ალაზნის გამზირი', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'კურდღელაურის ქუჩა', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'ერეკლე II-ის ქუჩა', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'რუსთაველის ქუჩა', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'თბილისის გზატკეცილი', trust: 'OFFICIAL_DOCUMENT' },
    ],
    officialMapAsset: 'telavi_route_4_official.png',
    sourceDocument: '№598 ბრძანებით დამტკიცებული საგამოცდო მარშრუტები',
    trust: {
      officialMap: 'OFFICIAL_DOCUMENT',
      polyline: 'ESTIMATED',
      streetNames: 'PENDING_REVIEW',
      startPoint: 'ESTIMATED',
    },
    geometryNoteKa:
      'ოფიციალური წყარო არის რასტრული რუკა და არა GPS-მონაცემი. მარშრუტის ხაზი სავარჯიშო მიახლოებაა, ადგილზე გადამოწმებული არ არის — რეალურ გამოცდაზე ყოველთვის იხელმძღვანელე გამომცდელის მითითებით და საგზაო ნიშნებით.',
    // წყაროს შენიშვნა: ოფიციალურ რასტრულ რუკაზე აღმოსავლეთის ვერტიკალური შემაერთებელი ქუჩის წარწერა არასაკმარისად მკაფიოა.
  },
  {
    id: 'telavi-route-5-v2026',
    city: 'Telavi',
    routeNumber: 5,
    category: 'B',
    versionDate: '2026-07-22',
    validFrom: '2026-07-22',
    validUntil: null,
    status: 'ACTIVE',
    officialSourceUrl: 'https://matsne.gov.ge/ka/document/view/6948586',
    lastVerifiedDate: '2026-08-08',
    startPoint: { lat: 41.9215, lng: 45.4782 },
    finishPoint: { lat: 41.9218, lng: 45.4785 },
    polyline: [
      { lat: 41.9215, lng: 45.4782 },
      { lat: 41.9220, lng: 45.4790 },
      { lat: 41.9218, lng: 45.4785 },
    ],
    instructions: [
      {
        id: 'tel-r5-i1',
        order: 1,
        location: { lat: 41.9217, lng: 45.4786 },
        triggerRadiusMeters: 25,
        instructionText: 'შეასრულეთ პარალელური პარკირება საგამოცდო ზონაში.',
        audioKey: 'PARKING',
        maneuverType: 'PARKING',
      },
    ],
    checkpoints: [],
    speedZones: [],
    hazardNotes: [],
    officialStreets: [
      { nameKa: 'ალაზნის გამზირი', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'დავით აღმაშენებლის ქუჩა', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'რუსთაველის ქუჩა', trust: 'OFFICIAL_DOCUMENT' },
      { nameKa: 'თბილისის გზატკეცილი', trust: 'OFFICIAL_DOCUMENT' },
    ],
    officialMapAsset: 'telavi_route_5_official.png',
    sourceDocument: '№598 ბრძანებით დამტკიცებული საგამოცდო მარშრუტები',
    trust: {
      officialMap: 'OFFICIAL_DOCUMENT',
      polyline: 'ESTIMATED',
      streetNames: 'MANUALLY_VERIFIED',
      startPoint: 'ESTIMATED',
    },
    geometryNoteKa:
      'ოფიციალური წყარო არის რასტრული რუკა და არა GPS-მონაცემი. მარშრუტის ხაზი სავარჯიშო მიახლოებაა, ადგილზე გადამოწმებული არ არის — რეალურ გამოცდაზე ყოველთვის იხელმძღვანელე გამომცდელის მითითებით და საგზაო ნიშნებით.',
  },
];

/**
 * 3. TECHNICAL VEHICLE QUESTIONS (GEORGIAN)
 */
/**
 * 4. B კატეგორიის ტექნიკური კითხვები — ოფიციალური 20 კითხვა.
 *    წყარო: sa.gov.ge/p/teqnikurigamartuloba + matsne.gov.ge/ka/document/view/5386464
 *    გამოცდაზე შემთხვევით ირჩევა 2. ტექსტი წყაროს იდენტურია — არ შეცვალო.
 */
export const TECHNICAL_QUESTIONS: TechnicalQuestion[] = [
  {
    id: 'B_TECH_01',
    category: 'B',
    questionKa: 'როგორ მოწმდება ძრავში ზეთის დონე?',
    answerKa:
      'ავტომობილი გააჩერე სწორ ზედაპირზე და გამორთე ძრავა; ცეცი ამოიღე, გაწმინდე, ჩასვი უკან და ხელახლა ამოღებისას დარწმუნდი, რომ კვალი MIN–MAX ნიშნულებს შორისაა.',
    responseMode: 'MIXED',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_02',
    category: 'B',
    questionKa: 'როგორ მოწმდება სამუხრუჭე სითხის დონე?',
    answerKa:
      'რეზერვუარზე სითხე უნდა იდგეს MIN და MAX ნიშნულებს შორის.',
    responseMode: 'MIXED',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_03',
    category: 'B',
    questionKa: 'როგორ მოწმდება მუშა მუხრუჭის გამართულობა?',
    answerKa:
      'ძრავის ჩართვამდე რამდენჯერმე დააჭირე პედალს, შემდეგ დაჭერილი გააჩერე და ჩართე ძრავა; პედალი ოდნავ უნდა დაიწიოს, არ უნდა იყოს ზედმეტად რბილი და დამუხრუჭებისას მანქანა გვერდზე არ უნდა ექაჩებოდეს.',
    responseMode: 'VERBAL',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_04',
    category: 'B',
    questionKa: 'როგორ მოწმდება სადგომი მუხრუჭი?',
    answerKa:
      'სწორ ზედაპირზე სრულად ჩართული სადგომი მუხრუჭით და გათიშული ტრანსმისიით ავტომობილი ხელით მიწოლისას არ უნდა გაგორდეს.',
    responseMode: 'MIXED',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_05',
    category: 'B',
    questionKa: 'სად ვნახოთ საბურავების რეკომენდებული წნევა?',
    answerKa:
      'ავტომობილის ექსპლუატაციის/მომსახურების ინსტრუქციაში ან მწარმოებლის მიერ ძარაზე განთავსებულ ფირნიშზე.',
    responseMode: 'VERBAL',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_06',
    category: 'B',
    questionKa: 'როგორ მოწმდება საბურავების საერთო უსაფრთხო მდგომარეობა?',
    answerKa:
      'ვიზუალურად შეამოწმე შესაბამისობა, წნევის აშკარა ნაკლებობა, დაზიანება, პროტექტორის განშრევება და ზედმეტი ცვეთა; ცვეთის ინდიკატორის გარეშე პროტექტორი 1.6 მმ-ზე ნაკლები არ უნდა იყოს.',
    responseMode: 'MIXED',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_07',
    category: 'B',
    questionKa: 'როგორ მოწმდება დამუხრუჭების სიგნალები?',
    answerKa:
      'მუხრუჭის პედალზე დაჭერისას ძირითადი და დამატებითი stop-ნათურები უნდა აინთოს და სტაბილურად იმუშაოს.',
    responseMode: 'MIXED',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_08',
    category: 'B',
    questionKa: 'როგორ მოწმდება საჭის გამაძლიერებელი?',
    answerKa:
      'ძრავის ჩართვის შემდეგ საჭის ტრიალი უნდა გამარტივდეს; მოძრაობა უნდა იყოს თანაბარი, ბიძგის, ვიბრაციისა და უჩვეულო ხმაურის გარეშე და საჭე თვითნებურად არ უნდა ტრიალებდეს.',
    responseMode: 'VERBAL',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_09',
    category: 'B',
    questionKa: 'როგორ მოწმდება გამაგრილებელი სითხის დონე?',
    answerKa:
      'ცივ და გამორთულ ძრავზე რეზერვუარში დონე MIN–MAX ნიშნულებს შორის უნდა იყოს.',
    responseMode: 'MIXED',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_10',
    category: 'B',
    questionKa: 'როგორ მოწმდება მოხვევის შუქ-მაჩვენებლები?',
    answerKa:
      'ჩართე მარცხენა და მარჯვენა მაჩვენებლები, გადაამოწმე დაფაზე ინდიკაცია და ვიზუალურად დარწმუნდი, რომ ყველა ნათურა ციმციმებს, სუფთაა და დაუზიანებელია.',
    responseMode: 'MIXED',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_11',
    category: 'B',
    questionKa: 'როგორ მოწმდება ფარები და შუქამრეკლები?',
    answerKa:
      'ჩართე გაბარიტები, ახლო და შორი ფარები; შეამოწმე დაფის ინდიკაცია და ვიზუალურად მათი მუშაობა, სისუფთავე და მთლიანობა. საჭიროებისას გამოიყენე კედელი ან სხვა ზედაპირი.',
    responseMode: 'MIXED',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_12',
    category: 'B',
    questionKa: 'როგორ მოწმდება საავარიო შუქსიგნალიზაცია?',
    answerKa:
      'ჩართე ავარიული სიგნალი და დარწმუნდი, რომ დაფაზე ინდიკატორია და ყველა მოხვევის მაჩვენებელი სინქრონულად ციმციმებს.',
    responseMode: 'MIXED',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_13',
    category: 'B',
    questionKa: 'როგორ მოწმდება მინამრეცხის რეზერვუარის სითხის დონე?',
    answerKa:
      'თუ მანქანას აქვს შესაბამისი დაფის ინდიკატორი, გამოიყენე ის; თუ არა, იხელმძღვანელე ავტომობილის ექსპლუატაციის ინსტრუქციით.',
    responseMode: 'VERBAL',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_14',
    category: 'B',
    questionKa: 'როგორ მოწმდება საბურავებში რეალური ჰაერის წნევა?',
    answerKa:
      'გამოიყენე მწარმოებლის მითითება და TPMS/მანომეტრი; წნევა შეამოწმე ცივ საბურავებზე.',
    responseMode: 'MIXED',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_15',
    category: 'B',
    questionKa: 'როგორ მოწმდება პროტექტორის საკმარისი სიმაღლე?',
    answerKa:
      'გამოიყენე მწარმოებლის მითითება და სპეციალური საზომი/სახაზავი; გაზომე ყველაზე მეტად გაცვეთილ ადგილზე.',
    responseMode: 'MIXED',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_16',
    category: 'B',
    questionKa: 'აჩვენე, სად მოწმდება გამაგრილებელი სითხის დონე.',
    answerKa:
      'აჩვენე ძრავის გაგრილების სისტემის რეზერვუარი.',
    responseMode: 'DEMONSTRATION',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_17',
    category: 'B',
    questionKa: 'აჩვენე, სად მდებარეობს მინამრეცხის რეზერვუარი.',
    answerKa:
      'აჩვენე მინამრეცხის სითხის რეზერვუარი.',
    responseMode: 'DEMONSTRATION',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_18',
    category: 'B',
    questionKa: 'აჩვენე, როგორ მოწმდება ხმოვანი სიგნალი.',
    answerKa:
      'საჭიროების შემთხვევაში ჩართე ანთება და დააჭირე სიგნალის ღილაკს; ხმა უნდა იყოს თანაბარი და საკმარისად მკაფიო.',
    responseMode: 'DEMONSTRATION',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_19',
    category: 'B',
    questionKa: 'აჩვენე, სად მოწმდება ძრავის ზეთის დონე.',
    answerKa:
      'აჩვენე ზეთის დონის ცეცის სახელური.',
    responseMode: 'DEMONSTRATION',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
  {
    id: 'B_TECH_20',
    category: 'B',
    questionKa: 'აჩვენე, სად მდებარეობს სამუხრუჭე სითხის რეზერვუარი.',
    answerKa:
      'აჩვენე სამუხრუჭე სითხის რეზერვუარი.',
    responseMode: 'DEMONSTRATION',
    officialSourceUrl: 'https://www.sa.gov.ge/p/teqnikurigamartuloba',
    sourceDocument: 'https://matsne.gov.ge/ka/document/view/5386464',
  },
];

/** გამოცდისთვის შემთხვევით ირჩევს N კითხვას */
export function pickRandomTechnicalQuestions(n = 2): TechnicalQuestion[] {
  return [...TECHNICAL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, n);
}

/**
 * 5. ხმოვანი ფაილები — ჩასაწერი ტექსტების სრული სია.
 *
 * თითოეული textKa არის ზუსტად ის, რაც ხმაში უნდა ჩაიწეროს.
 * ადმინის პანელიდან თითოეულ key-ს ეყრდნობა ატვირთული mp3/m4a ფაილი.
 * სანამ ფაილი არ აიტვირთება, სისტემა იყენებს ბრაუზერის სინთეზურ ხმას (fallback).
 */
export const DEFAULT_AUDIO_ASSETS: AudioAsset[] = [
  { key: 'EXAM_START', group: 'SYSTEM', titleKa: 'გამოცდის დაწყება', textKa: 'გამოცდა დაიწყო. იმოძრავეთ უსაფრთხოდ და დაიცავით საგზაო მოძრაობის წესები.' },
  { key: 'EXAM_FINISHED', group: 'SYSTEM', titleKa: 'გამოცდის დასრულება', textKa: 'გამოცდის სიმულაცია დასრულებულია. გმადლობთ.' },
  { key: 'GET_READY', group: 'SYSTEM', titleKa: 'მზადყოფნა', textKa: 'მოემზადეთ. გამოცდა დაიწყება რამდენიმე წამში.' },
  { key: 'CONTINUE_STRAIGHT', group: 'CORE', titleKa: 'პირდაპირ სვლა', textKa: 'განაგრძეთ მოძრაობა პირდაპირ.' },
  { key: 'TURN_LEFT', group: 'CORE', titleKa: 'მარცხნივ მოხვევა', textKa: 'შემდეგ გზაჯვარედინზე მოუხვიეთ მარცხნივ.' },
  { key: 'TURN_RIGHT', group: 'CORE', titleKa: 'მარჯვნივ მოხვევა', textKa: 'შემდეგ გზაჯვარედინზე მოუხვიეთ მარჯვნივ.' },
  { key: 'TURN_LEFT_NOW', group: 'CORE', titleKa: 'მარცხნივ ახლა', textKa: 'მოუხვიეთ მარცხნივ.' },
  { key: 'TURN_RIGHT_NOW', group: 'CORE', titleKa: 'მარჯვნივ ახლა', textKa: 'მოუხვიეთ მარჯვნივ.' },
  { key: 'SECOND_LEFT', group: 'CORE', titleKa: 'მეორე მოხვევა მარცხნივ', textKa: 'მეორე გზაჯვარედინზე მოუხვიეთ მარცხნივ.' },
  { key: 'SECOND_RIGHT', group: 'CORE', titleKa: 'მეორე მოხვევა მარჯვნივ', textKa: 'მეორე გზაჯვარედინზე მოუხვიეთ მარჯვნივ.' },
  { key: 'CHANGE_LANE_LEFT', group: 'MANEUVER', titleKa: 'ზოლის შეცვლა მარცხნივ', textKa: 'უსაფრთხოების დაცვით გადაინაცვლეთ მარცხენა ზოლში.' },
  { key: 'CHANGE_LANE_RIGHT', group: 'MANEUVER', titleKa: 'ზოლის შეცვლა მარჯვნივ', textKa: 'უსაფრთხოების დაცვით გადაინაცვლეთ მარჯვენა ზოლში.' },
  { key: 'U_TURN', group: 'MANEUVER', titleKa: 'უკან მობრუნება', textKa: 'შემდეგ ნებადართულ ადგილას შეასრულეთ უკან მობრუნება.' },
  { key: 'ROUNDABOUT', group: 'MANEUVER', titleKa: 'წრიული მოძრაობა', textKa: 'წინ არის წრიული მოძრაობა. დაუთმეთ გზა წრეზე მოძრავ ავტომობილებს.' },
  { key: 'ROUNDABOUT_FIRST_EXIT', group: 'MANEUVER', titleKa: 'წრე — პირველი გასასვლელი', textKa: 'წრიულ მოძრაობაზე გაჰყევით პირველ გასასვლელს.' },
  { key: 'ROUNDABOUT_SECOND_EXIT', group: 'MANEUVER', titleKa: 'წრე — მეორე გასასვლელი', textKa: 'წრიულ მოძრაობაზე გაჰყევით მეორე გასასვლელს.' },
  { key: 'PULL_OVER_SAFE', group: 'MANEUVER', titleKa: 'უსაფრთხო გაჩერება', textKa: 'როცა უსაფრთხოდ ჩათვლით, გაჩერდით გზის მარჯვენა მხარეს.' },
  { key: 'RESUME_DRIVING', group: 'MANEUVER', titleKa: 'მოძრაობის გაგრძელება', textKa: 'განაგრძეთ მოძრაობა.' },
  { key: 'HILL_START', group: 'MANEUVER', titleKa: 'აღმართზე დაძვრა', textKa: 'შეჩერდით აღმართზე და დაიძარით უკან დაგორების გარეშე.' },
  { key: 'PARK_PARALLEL', group: 'MANEUVER', titleKa: 'პარალელური პარკირება', textKa: 'შეასრულეთ პარალელური პარკირება მონიშნულ ადგილას.' },
  { key: 'REVERSE', group: 'MANEUVER', titleKa: 'უკუსვლა', textKa: 'შეასრულეთ უკუსვლა უსაფრთხოების დაცვით.' },
  { key: 'STOP_SIGN', group: 'HAZARD', titleKa: 'STOP ნიშანი', textKa: 'წინ არის STOP ნიშანი. შეასრულეთ სრული გაჩერება.' },
  { key: 'PEDESTRIAN_CROSSING', group: 'HAZARD', titleKa: 'ქვეითთა გადასასვლელი', textKa: 'ყურადღება, წინ არის ქვეითთა გადასასვლელი.' },
  { key: 'TRAFFIC_LIGHT_AHEAD', group: 'HAZARD', titleKa: 'შუქნიშანი', textKa: 'წინ არის შუქნიშანი.' },
  { key: 'GIVE_WAY', group: 'HAZARD', titleKa: 'გზის დათმობა', textKa: 'დაუთმეთ გზა.' },
  { key: 'SCHOOL_ZONE', group: 'HAZARD', titleKa: 'სასკოლო ზონა', textKa: 'ყურადღება, სასკოლო ზონა. შეამცირეთ სიჩქარე.' },
  { key: 'SPEED_WARNING', group: 'HAZARD', titleKa: 'სიჩქარის გაფრთხილება', textKa: 'ყურადღება, სიჩქარე გადააჭარბეთ. შეამცირეთ სიჩქარე.' },
  { key: 'NARROW_ROAD', group: 'HAZARD', titleKa: 'ვიწრო გზა', textKa: 'წინ არის ვიწრო მონაკვეთი. იმოძრავეთ ფრთხილად.' },
  { key: 'RAILWAY', group: 'HAZARD', titleKa: 'რკინიგზა', textKa: 'წინ არის რკინიგზის გადასასვლელი. შეამცირეთ სიჩქარე და დარწმუნდით უსაფრთხოებაში.' },
  { key: 'ROUTE_DEVIATION', group: 'SYSTEM', titleKa: 'მარშრუტიდან გადახვევა', textKa: 'თქვენ გადაუხვიეთ მარშრუტიდან.' },
  { key: 'GPS_WARNING', group: 'SYSTEM', titleKa: 'GPS გაფრთხილება', textKa: 'GPS სიგნალი შესუსტდა. ავტომატური შეფასება შეიძლება ნაკლებად ზუსტი იყოს.' },
  { key: 'AUDIO_TEST', group: 'SYSTEM', titleKa: 'ხმის შემოწმება', textKa: 'ეს არის სატესტო ხმოვანი შეტყობინება. თუ კარგად გესმით, დააჭირეთ ღილაკს.' },
  { key: 'TECH_QUESTION_INTRO', group: 'TECHNICAL', titleKa: 'ტექნიკური კითხვა', textKa: 'ახლა გეკითხებით ტექნიკურ კითხვას ავტომობილის გამართულობის შესახებ.' },
];


export const DEFAULT_ROAD_WARNINGS: RoadWarning[] = [
  {
    id: 'warn-tel-01',
    city: 'Telavi',
    routeNumber: 2,
    locationName: 'ილია ილია ჭავჭავაძის გამზირი',
    coordinates: { lat: 41.9240, lng: 45.4820 },
    warningText: 'მიმდინარეობს გზის საფარის სარემონტო სამუშაოები. სიჩქარის შეზღუდვა 30 კმ/სთ.',
    reportedAt: '2026-08-01',
    verifiedAt: '2026-08-08',
    source: 'თელავის მუნიციპალიტეტის ოფიციალური შეტყობინება',
    isActive: true,
  },
];

/**
 * 6. DEMO USERS AND PROFILES
 */
export const DEMO_USERS: User[] = [
  {
    id: 'user-student-01',
    firstName: 'გიორგი',
    lastName: 'მაისურაძე',
    email: 'giorgi.student@example.com',
    phone: '599112233',
    role: 'STUDENT',
    preferredCity: 'Telavi',
    category: 'B',
    transmission: 'MANUAL',
    createdAt: '2026-07-01',
  },
  {
    id: 'user-instructor-01',
    firstName: 'დავით',
    lastName: 'ბერიძე',
    email: 'davit.instructor@example.com',
    phone: '599887766',
    role: 'INSTRUCTOR',
    preferredCity: 'Telavi',
    category: 'B',
    transmission: 'BOTH',
    createdAt: '2026-06-15',
  },
  {
    id: 'user-admin-01',
    firstName: 'ადმინისტრატორი',
    lastName: 'სისტემის',
    email: 'admin@sim.ge',
    role: 'ADMIN',
    preferredCity: 'Telavi',
    category: 'B',
    transmission: 'BOTH',
    createdAt: '2026-01-01',
  },
];

export const DEMO_STUDENT_PROFILE: StudentProfile = {
  id: 'prof-student-01',
  userId: 'user-student-01',
  instructorId: 'prof-instructor-01',
  preferredCity: 'Telavi',
  category: 'B',
  transmission: 'MANUAL',
  preparationScore: 78,
  totalSimulations: 18,
  totalPasses: 12,
  totalFails: 6,
  totalDrivingMinutes: 340,
  frequentMistakes: ['სარკეში უყურადღებობა', 'STOP ნიშანთან სრული გაჩერების იგნორირება', 'მოხვევის ციმციმა'],
  notes: 'აღმართზე დაძვრა საგრძნობლად გაუმჯობესდა. ყურადღება მიაქციეთ სარკეებს მოხვევამდე.',
  createdAt: '2026-07-01',
};

export const DEMO_INSTRUCTOR_PROFILE: InstructorProfile = {
  id: 'prof-instructor-01',
  userId: 'user-instructor-01',
  drivingSchool: 'თელავის ავტოსკოლა DriveMaster',
  mainCity: 'Telavi',
  categories: ['B', 'BE'],
  transmission: 'BOTH',
  phone: '599887766',
  activeStudentsCount: 14,
  rating: 4.9,
};
