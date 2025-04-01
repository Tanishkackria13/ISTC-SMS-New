export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/teacher(.*)": ["teacher"],
  "/registrar(.*)": ["registrar"],
  "/theoryIncharge(.*)": ["theoryIncharge"],
  "/list/teachers": ["admin", "teacher", "registrar","theoryIncharge" ],
  "/list/students": ["admin", "teacher", "registrar", "theoryIncharge"],
  "/list/registrars": ["admin"],
  "/list/theoryIncharges": ["admin"],
  "/list/subjects": ["registrar", "theoryIncharge"],
  "/list/branches": ["registrar", "teacher", "theoryIncharge"],
  "/list/exams": ["teacher", "registrar", "theoryIncharge"],
  "/list/assignments": ["teacher"],
  "/list/results": ["teacher", "registrar", "theoryIncharge"],
  "/list/attendance": ["teacher", "registrar"],
  "/list/announcements": ["admin", "teacher",  "registrar","theoryIncharge"],
  
};