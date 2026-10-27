// Industry guides: nine customer guide pages in the museum-guide layout, plus a hub at guides/index.html.
// Copy comes word for word from Jess's workbook (OBS_Website_Copy_Changes_final.xlsx, one sheet per guide; the
// museum guide is the production page with rows G1 to G26 applied). Edit copy here only to match that workbook.
//
// Used by build.js (it never edits this file):
//   const GD = require('./guides');
//   fs.appendFileSync(path.join(OUT, 'assets', 'style.css'), GD.guideCss);
//   for (const p of GD.allPages(shell, { X, VER })) { ...write p.html to p.path... }
// Exports:
//   GUIDES                     the data below
//   guideCss                   CSS for the guide pages, the hub, and the Storage Redefined entry (.sr)
//   srEntry({word,pos,old,redefined,onDark})   dictionary-style "Storage Redefined" entry markup
//   guidePages(shell, ctx)     [{path:'guides/<slug>/index.html', html}] for the nine guides
//   guidesIndex(shell, ctx)    {path:'guides/index.html', html} hub page
//   allPages(shell, ctx)       guidePages + guidesIndex
//   relink(html, prefix)       prefixes relative href/src/data-bg/data-src/url() values (used for the deeper paths)
// shell(title, heroImgUrl, body) is build.js's page shell; ctx = { X: require('./extras'), VER, keepSiteCta } (all optional).
// Guide pages end with their own call to action, so the shell's <div class="cta" id="contact"> is dropped from them
// unless ctx.keepSiteCta is set; the hub keeps it.
// Pages come back finished: SEO head (X.enrich), lazy media (X.lazyMedia), links fixed for their depth,
// and the build's copy guard applied (no em dashes, no "nationwide").
'use strict';

/* ---------------- data (generated from the workbook, photos picked by hand) ---------------- */
// card.model: 3D model id (assets/3d/models.js). If it is one of the guide's viewer tabs (v3d.models), the
// "See it in 3D" button opens it in the page's viewer; otherwise it links to that model in the 3D showroom.
// v3d.tabs are the workbook's tab names; v3d.models are the matching model ids in the same order (first opens first).
const GUIDES = [
 {
  "slug": "museum-collections",
  "sheet": "Museum Guide",
  "name": "Museums & Collections",
  "title": "Museum & Collections Storage Guide",
  "sr": {
   "word": "pres·er·va·tion",
   "pos": "n.",
   "old": "A locked door and a dehumidifier.",
   "redefined": "Storage that protects every object, today and for generations to come."
  },
  "eyebrow": "Museum and collections storage",
  "headline": "Preserving history for the ages",
  "tagline": "Improved preservation. Improved security. Improved access.",
  "introHeading": "Better ways to store and preserve",
  "intro": [
   "Security, preservation, and access: the right storage keeps a collection safe, easy to reach, and ready to grow. Every project starts with an on-site needs analysis. We review your object inventory, look at your space and security needs, and design storage that fits your collection, from a single cabinet to a full collections storage facility.",
   "We design, supply, and install, and our own crews handle every installation throughout the Philadelphia region and beyond. We work alongside your registrars, conservators, architects, and engineers so the storage supports your conservation standards from the first drawing."
  ],
  "cardsHeading": "Storage for every part of the collection",
  "hero": {
   "src": "assets/guides/museum-collections/mus-visible-storage-room-lg.jpg",
   "alt": "Visible storage room with flat file cabinets and framed works on the walls"
  },
  "introImg": {
   "src": "assets/guides/museum-collections/mus-visible-storage-cabinets-lg.jpg",
   "alt": "Visible storage cabinets with glass doors and open drawers holding a museum collection"
  },
  "cards": [
   {
    "title": "Preservation cabinets",
    "text": "Steel museum storage cabinets with removable trays and drawers for herbarium sheets, fossils, insects, archaeology, and archival collections. Gasketed doors help protect against dust and pests and maintain a stable microclimate, and collection-safe finishes won’t off-gas onto collections.",
    "model": "museum-cabinet",
    "img": "assets/guides/museum-collections/mus-preservation-cabinet-trays.jpg",
    "alt": "Museum storage cabinet open to rows of trays"
   },
   {
    "title": "Visible storage",
    "text": "Glass-front cabinets over drawers put study collections on view while keeping them protected, so visitors and researchers can see objects without handling them.",
    "model": null,
    "img": "assets/guides/museum-collections/mus-visible-storage-drawers.jpg",
    "alt": "Glass-front cabinets over open drawers holding a study collection"
   },
   {
    "title": "Standard and specialty drawers",
    "text": "Flat files and full-extension drawers for maps, prints, photographs, textiles, and works on paper. Full-extension drawers let you lift an object straight out without sliding or rubbing.",
    "model": null,
    "img": "assets/guides/museum-collections/mus-flat-file-drawers.jpg",
    "alt": "Flat file cabinet with wide drawers pulled open"
   },
   {
    "title": "High-density mobile storage",
    "text": "Shelving, cabinets, and racks mounted on carriages that glide along floor rails, so only the aisle you need is open. The same room can hold up to twice the collection, and systems can be locked closed for added security.",
    "model": "hd-mobile-museum",
    "img": "assets/guides/museum-collections/mus-high-density-aisle.jpg",
    "alt": "Open aisle between high-density mobile cabinets"
   },
   {
    "title": "Art racks and screens",
    "text": "Pull-out and lateral mesh screens for framed works and hanging textiles. Each piece hangs on its own hooks, face out and visible, with nothing leaning or stacked.",
    "model": "hd-mobile-art",
    "img": "assets/guides/museum-collections/mus-art-screens.jpg",
    "alt": "Mesh art screens pulled out with a painting hanging on one"
   },
   {
    "title": "Framed art storage bins",
    "text": "Divided bins for framed and unframed works stored upright, each slot padded and sized to the piece, with roll-up doors that help protect against dust and light.",
    "model": "painting-bins",
    "img": "assets/guides/museum-collections/mus-render-painting-bins.jpg",
    "alt": "Divided bin unit holding framed works upright (3D rendering)"
   },
   {
    "title": "Wall-mounted art screens",
    "text": "Fixed mesh panels mounted to a wall hold framed works, plaques, and lighter sculpture on ledges and hooks, turning wall space in a vault or workroom into storage.",
    "model": "wall-art",
    "img": "assets/guides/museum-collections/mus-render-wall-art.jpg",
    "alt": "Wall-mounted mesh panel holding framed works and objects (3D rendering)"
   },
   {
    "title": "Solander box shelving",
    "text": "4-post shelving sized to archival and solander boxes, with shallow shelves so every box slides out on its own and nothing is stacked on top of another.",
    "model": "four-post-solander",
    "img": "assets/media/2022/09/Museum-Storage-Solanderbox.jpg",
    "alt": "Shelving sized to solander boxes, with a box on the counter in front"
   },
   {
    "title": "Textile racks",
    "text": "Rolled storage for rugs, quilts, flags, and other large textiles, with each roll supported on its own tube. Deep rolled pieces come out without unloading their neighbors.",
    "model": "textile-rack",
    "img": "assets/guides/museum-collections/mus-rolled-textile-rack.jpg",
    "alt": "Rolled textiles stored on individual tubes"
   },
   {
    "title": "Costume and hanging storage",
    "text": "Garment rods, shelves, and drawers combined in one system for historical clothing, costumes, and accessories, with room for padded hangers and boxed pieces side by side.",
    "model": null,
    "img": "assets/guides/museum-collections/mus-costume-storage.jpg",
    "alt": "Historical clothing on garment rods above shelves"
   },
   {
    "title": "Wide-span and bulk shelving",
    "text": "Heavy-duty open shelving for furniture, sculpture, geological specimens, animal mounts, and other large or irregular objects, with padded decks and room to move pieces safely.",
    "model": null,
    "img": "assets/guides/museum-collections/mus-furniture-bulk-storage.jpg",
    "alt": "Furniture and large objects on heavy-duty open shelving"
   },
   {
    "title": "Mobile object racks",
    "text": "Open racks on carriages that glide along floor rails for sculpture, ceramics, and boxed objects, so large, heavy pieces get the same space savings as high-density mobile storage.",
    "model": "hd-mobile-artrack",
    "img": "assets/guides/museum-collections/mus-render-hd-mobile-artrack.jpg",
    "alt": "Open object racks on mobile carriages holding boxed objects (3D rendering)"
   },
   {
    "title": "Wall E-track systems",
    "text": "Steel track rails anchored to the wall, with straps that secure crates, pallets, framed works, and sculpture in place during storage, moves, and installation.",
    "model": "wall-etrack",
    "img": "assets/guides/museum-collections/mus-render-wall-etrack.jpg",
    "alt": "Wall track rails with straps holding crates (3D rendering)"
   },
   {
    "title": "Weapons and long objects",
    "text": "Wall and rack systems that hold staffs, spears, firearms, and other long objects upright and separated, each in its own padded cradle.",
    "model": null,
    "img": "assets/guides/museum-collections/mus-weapons-storage.jpg",
    "alt": "Spears and staffs held upright on a wall rack"
   },
   {
    "title": "Library and archive shelving",
    "text": "Cantilever library shelving, high-density mobile storage, and static shelving for a museum library, curatorial files, catalogs, and archival records, kept alongside the collection they document.",
    "model": null,
    "img": "assets/guides/museum-collections/mus-mobile-library-shelving.jpg",
    "alt": "Mobile shelving holding a museum library"
   },
   {
    "title": "Collections workrooms",
    "text": "Worktables, flat files, and cabinets for processing, study, and conservation rooms, designed with the storage so objects move a short, safe distance.",
    "model": null,
    "img": "assets/guides/museum-collections/mus-collections-workroom.jpg",
    "alt": "Collections workroom with worktables and flat files"
   }
  ],
  "v3d": {
   "eyebrow": "Explore in 3D",
   "heading": "Open the drawers, move the carriages, see how it works",
   "sub": "Drag to turn a model, tap parts to open them, and pick another system from the list.",
   "tabs": null,
   "models": [
    "museum-cabinet",
    "hd-mobile-museum",
    "art-screens",
    "hd-mobile-art",
    "painting-bins",
    "textile-rack",
    "hd-mobile-textile",
    "four-post-solander",
    "hd-mobile-bins",
    "wall-art",
    "hd-mobile-artrack",
    "wall-etrack"
   ]
  },
  "appsHeading": "Applications for every specialty",
  "appsIntro": "Anthropology, paleontology, archaeology, ethnology, ornithology, geology, entomology, textiles, archives, and art.",
  "apps": [
   {
    "title": "Specimens",
    "items": [
     "Animals",
     "Insects",
     "Plants",
     "Skeletal",
     "Wet collections"
    ]
   },
   {
    "title": "Hanging",
    "items": [
     "Paintings",
     "Hanging textiles",
     "Prints",
     "Photographs",
     "Masks"
    ]
   },
   {
    "title": "Drawers",
    "items": [
     "Photographs",
     "Art and artifacts",
     "Textiles",
     "Maps",
     "Works on paper"
    ]
   },
   {
    "title": "Archives",
    "items": [
     "Records",
     "Photographs",
     "Maps",
     "Books",
     "Film"
    ]
   },
   {
    "title": "Bulk storage",
    "items": [
     "Geological specimens",
     "Paleontology",
     "Furniture and housewares",
     "Animal mounts",
     "Sculpture"
    ]
   },
   {
    "title": "Textiles",
    "items": [
     "Rolled textiles",
     "Flat textiles",
     "Costumes",
     "Historical clothing",
     "Accessories"
    ]
   },
   {
    "title": "Preservation cabinets",
    "items": [
     "Herbarium specimens",
     "Fossils",
     "Insect collections",
     "Archaeology",
     "Archival collections"
    ]
   },
   {
    "title": "Oversized and framed",
    "items": [
     "Large paintings",
     "Frames and panels",
     "Mirrors",
     "Architectural fragments",
     "Crated objects"
    ]
   }
  ],
  "gallery": [
   {
    "src": "assets/guides/museum-collections/mus-costume-collection-lg.jpg",
    "alt": "Costume collection on garment rods above storage drawers"
   },
   {
    "src": "assets/guides/museum-collections/mus-mobile-shelving-aisle-lg.jpg",
    "alt": "Open aisle in a high-density mobile shelving system"
   }
  ],
  "cta": {
   "heading": "Let's look at your collection together",
   "text": "We’ll walk your storage areas, review the inventory with your team, and lay out options that fit your space, collection, and budget."
  }
 },
 {
  "slug": "healthcare-pharmaceutical",
  "sheet": "Healthcare Guide",
  "name": "Healthcare & Pharmaceutical",
  "title": "Healthcare & Pharmaceutical Storage Guide",
  "sr": {
   "word": "ster·ile core",
   "pos": "n.",
   "old": "A back room full of carts and boxes.",
   "redefined": "Clean, organized supplies on the shortest path to patient care."
  },
  "eyebrow": "Healthcare and pharmaceutical storage",
  "headline": "More room for patient care",
  "tagline": "Improved organization. Improved security. Improved use of space.",
  "introHeading": "Better ways to store and supply care",
  "intro": [
   "Organization, security, and space: the right storage keeps supplies clean, easy to find, and close to where care happens. Every project starts with an on-site needs analysis. We review your inventory, look at your space, workflow, and security needs, and design storage that fits your facility, from a single supply room to a full hospital or lab building.",
   "We design, supply, and install, and our own crews have worked in active healthcare and pharmaceutical facilities, including many health systems, children’s hospitals, and major pharmaceutical companies. We work alongside your supply chain, pharmacy, lab, facilities, and infection prevention teams, plus your architects and engineers, and coordinate every installation around infection control requirements and clinical schedules throughout the Philadelphia region and beyond."
  ],
  "cardsHeading": "Storage for every part of the facility",
  "hero": {
   "src": "assets/guides/healthcare-pharmaceutical/hc-sterile-supply-shelving-lg.jpg",
   "alt": "Hospital supply room with wire shelving and a supply cart"
  },
  "introImg": {
   "src": "assets/media/2023/04/nemours1.jpg",
   "alt": "Open aisle in a high-density mobile system in a hospital supply area"
  },
  "cards": [
   {
    "title": "High-density mobile storage",
    "text": "Shelving and cabinets mounted on carriages that glide along floor rails, so only the aisle you need is open. Supply and storage rooms can hold up to twice as much in the same space, and systems can be locked closed for added security.",
    "model": "install",
    "img": "assets/guides/healthcare-pharmaceutical/hc-hospital-mobile-supply.jpg",
    "alt": "High-density mobile shelving installed in a hospital supply room",
    "photoNote": "central supply on mobile carriages"
   },
   {
    "title": "Wire shelving",
    "text": "Chrome, epoxy-coated, and antimicrobial wire shelving for supply rooms, sterile core, and pharmacies. The open design keeps contents visible from every angle and is easy to clean and reconfigure.",
    "model": "wire-shelving",
    "img": "assets/media/2026/06/9eafe-ph-wire-rack.jpg",
    "alt": "Wire shelving holding supply bins",
    "photoNote": "supply room wire shelving"
   },
   {
    "title": "Mobile wire shelving",
    "text": "Wire shelving on carriages for sterile supplies and pharmacy inventory, with the space savings of high-density mobile storage and the airflow of open wire.",
    "model": "wire-track",
    "img": "assets/media/mfr/wire-shelving--4.jpg",
    "alt": "Rows of chrome wire shelving on mobile carriages",
    "photoNote": "mobile wire shelving, sterile core"
   },
   {
    "title": "Polymer shelving",
    "text": "Polymer shelving that can go through a cart washer, for wet areas, sterile processing, and spaces that need frequent cleaning.",
    "model": null,
    "img": "assets/media/mfr/wire-shelving--3.jpg",
    "alt": "Green coated shelving units holding kitchen and supply items",
    "photoNote": "polymer shelving"
   },
   {
    "title": "Supply carts",
    "text": "Wire carts and shelving on casters that move supplies from central storage to the floor. Bin fronts and labels make par levels easy to check and restock.",
    "model": null,
    "img": "assets/media/mfr/wire-shelving--2.png",
    "alt": "Supply room with wire shelving and carts stocked with medical supplies",
    "photoNote": "supply carts on a unit"
   },
   {
    "title": "Vertical lift modules",
    "text": "Enclosed towers that store trays and bring the right one to an access opening on demand. Access controls and transaction tracking help secure high-value pharmacy and supply inventory.",
    "model": "vlm",
    "img": "assets/guides/healthcare-pharmaceutical/hc-vertical-lift-module.jpg",
    "alt": "Vertical lift module access opening with supply totes",
    "photoNote": "vlm in a pharmacy"
   },
   {
    "title": "Vertical carousels",
    "text": "Rotating shelves inside an enclosed unit that bring stored items to a comfortable working height, making the most of tall ceilings in pharmacies and supply rooms.",
    "model": "vertical-carousel",
    "img": "assets/media/2026/06/7ec0c-lifts.jpg",
    "alt": "Enclosed vertical carousel units with open access windows",
    "photoNote": "vertical carousel"
   },
   {
    "title": "Modular drawer cabinets",
    "text": "Modular drawer cabinets and bin shelving with dividers for small supplies, medications, and parts, so every item has its own labeled place.",
    "model": null,
    "img": "assets/guides/healthcare-pharmaceutical/mh-shelving-drawers.jpg",
    "alt": "Modular drawer cabinets below bin shelving",
    "photoNote": "modular drawer cabinets"
   },
   {
    "title": "Controlled-substance cages",
    "text": "Wire partitions that create a lockable, see-through perimeter for controlled substances and high-value inventory. DEA-regulated storage has its own mesh, ceiling, and locking requirements, and we design around them.",
    "model": "wire-cage",
    "img": "assets/guides/healthcare-pharmaceutical/ps-mesh-partitions.jpg",
    "alt": "White wire mesh partitions forming lockable enclosures",
    "photoNote": "wire partition cage"
   },
   {
    "title": "Lab casework",
    "text": "Steel casework and chemical-resistant surfaces for labs, with modular pieces that adapt clinical support spaces without construction.",
    "model": "casework",
    "img": "assets/guides/healthcare-pharmaceutical/hc-lab-casework.jpg",
    "alt": "Laboratory casework with a sink and chemical-resistant work surface",
    "photoNote": "modular lab casework"
   },
   {
    "title": "Records and file storage",
    "text": "High-density mobile storage and rotary cabinets for patient records, HR files, and administrative storage, kept secure and close at hand.",
    "model": null,
    "img": "assets/guides/healthcare-pharmaceutical/hc-records-aisle.jpg",
    "alt": "Mobile shelving filled with patient record folders",
    "photoNote": "records room"
   },
   {
    "title": "Staff and smart lockers",
    "text": "Personal lockers for staff locker rooms, and smart lockers that assign, unlock, and track compartments electronically for shared equipment and package delivery.",
    "model": "smart-lockers",
    "img": "assets/guides/healthcare-pharmaceutical/hc-staff-lockers.jpg",
    "alt": "Staff locker room with steel lockers and a bench",
    "photoNote": "staff locker room"
   }
  ],
  "v3d": {
   "eyebrow": "Explore in 3D",
   "heading": "Open the trays, move the carriages, see how it works",
   "sub": "Drag to turn a model, tap parts to open them, and pick another system from the list.",
   "tabs": [
    "Vertical Lift Module (VLM)",
    "High-Density Mobile Storage Install, Step by Step",
    "Chrome Wire Shelving",
    "Mobile Wire Shelving on Overhead Track",
    "Modular Lab Casework",
    "Wire Partition Enclosure"
   ],
   "models": [
    "vlm",
    "install",
    "wire-shelving",
    "wire-track",
    "casework",
    "wire-cage"
   ]
  },
  "appsHeading": "Applications for every department",
  "appsIntro": "Hospitals, health systems, children’s hospitals, outpatient centers, pharmacies, labs, and pharmaceutical manufacturing and distribution.",
  "apps": [
   {
    "title": "Central supply",
    "items": [
     "Med-surg supplies",
     "Linens",
     "Bulk stock",
     "Par-level carts",
     "Receiving and staging"
    ]
   },
   {
    "title": "Sterile core",
    "items": [
     "Sterile supplies",
     "Instrument trays",
     "Case carts",
     "Procedure packs",
     "Implants"
    ]
   },
   {
    "title": "Pharmacy",
    "items": [
     "Medications",
     "IV supplies",
     "Controlled substances",
     "Compounding supplies",
     "Bulk inventory"
    ]
   },
   {
    "title": "Lab",
    "items": [
     "Reagents and consumables",
     "Specimen supplies",
     "Glassware",
     "Chemical storage",
     "Small equipment"
    ]
   },
   {
    "title": "Clinical units",
    "items": [
     "Nurse station supplies",
     "Clean utility rooms",
     "Equipment alcoves",
     "Patient belongings",
     "Staff lockers"
    ]
   },
   {
    "title": "Records and admin",
    "items": [
     "Patient records",
     "HR files",
     "Billing records",
     "Forms and supplies",
     "Archives"
    ]
   },
   {
    "title": "Pharmaceutical",
    "items": [
     "Raw materials",
     "Packaging components",
     "Retained samples",
     "QA records",
     "Finished goods"
    ]
   },
   {
    "title": "Facilities",
    "items": [
     "Maintenance parts",
     "Biomedical parts",
     "Tools",
     "Engineering records",
     "Spare equipment"
    ]
   }
  ],
  "gallery": [
   {
    "src": "assets/media/mfr/pharmaceutical-healthcare--3.jpg",
    "alt": "Pharmacy shelving and casework stocked with medications"
   },
   {
    "src": "assets/media/mfr/modular-casework--1.jpg",
    "alt": "Laboratory with casework, an island bench and fume hoods"
   }
  ],
  "cta": {
   "heading": "Let’s look at your space together",
   "text": "We’ll walk your supply rooms, pharmacy, and storage areas, review your inventory with your team, and lay out options that fit your space, workflow, and budget."
  }
 },
 {
  "slug": "athletics",
  "sheet": "Athletics Guide",
  "name": "Athletics",
  "title": "Athletic Equipment Storage Guide",
  "sr": {
   "word": "lock·er room",
   "pos": "n.",
   "old": "A row of metal lockers and a bench.",
   "redefined": "A team room built around every player, their gear, and your program."
  },
  "eyebrow": "Athletic equipment and team room storage",
  "headline": "Built for game day, every day",
  "tagline": "Improved organization. Improved airflow. Improved use of space.",
  "introHeading": "Better ways to store and organize gear",
  "intro": [
   "Organization, airflow, and space: the right storage keeps gear dry, easy to find, and ready for the next practice. Every project starts with an on-site needs analysis. We review your equipment inventory, look at your space and how your teams use it, and design storage that fits your program, from a single team room to a full athletic facility.",
   "We design, supply, and install, and our own crews handle every installation throughout the Philadelphia region and beyond. We work alongside your athletic directors, equipment managers, coaches, architects, and facilities teams so the storage fits how your program runs from the first drawing."
  ],
  "cardsHeading": "Storage for every part of the program",
  "hero": {
   "src": "assets/media/2026/06/fe33b-summit-lockers-brochure-2048x1597.jpeg",
   "alt": "Team room with wood lockers and a bench"
  },
  "introImg": {
   "src": "assets/guides/athletics/edu-team-lockers-lg.jpg",
   "alt": "Team room lined with wood-finish lockers"
  },
  "cards": [
   {
    "title": "Athletic team lockers",
    "text": "Open-front and ventilated lockers for the team room, with a place for each player’s helmet, pads, cleats, and personal items. Ventilated designs let gear air out between practices.",
    "model": "athletic",
    "img": "assets/guides/athletics/edu-locker-room.jpg",
    "alt": "Team room with ventilated steel lockers and a built-in bench",
    "photoNote": "team room lockers"
   },
   {
    "title": "High-density mobile storage",
    "text": "Shelving and gear compartments mounted on carriages that glide along floor rails, so only the aisle you need is open. The same equipment room can hold up to twice the gear, and systems can be locked closed for added security.",
    "model": "install",
    "img": "assets/guides/athletics/edu-athletic-mobile-storage.jpg",
    "alt": "Equipment room on mobile carriages with jerseys, bags and gear",
    "photoNote": "equipment room on mobile carriages"
   },
   {
    "title": "Custom cradles and holders",
    "text": "Helmet, shoulder pad, stick, and bat holders sized to the sport, so every piece has its own place and nothing is piled in a bin.",
    "model": null,
    "img": "assets/guides/athletics/ps-gear-storage.jpg",
    "alt": "Gear cabinet with vertical holders and helmets on the lower shelf",
    "photoNote": "helmet and pad holders"
   },
   {
    "title": "Equipment cages",
    "text": "Wire mesh partitions that turn open floor space into lockable cages for balls, training gear, and travel bags, with airflow and visibility from every side.",
    "model": "wire-cage",
    "img": "assets/guides/athletics/gov-wire-cages.jpg",
    "alt": "Row of lockable wire mesh cages",
    "photoNote": "wire partition equipment cage"
   },
   {
    "title": "Wire shelving",
    "text": "Open wire shelving for balls, cones, pads, and training equipment. Open decks let air move around damp gear and make it easy to see what’s on hand.",
    "model": "wire-shelving",
    "img": "assets/media/2026/08/IMG_1946-rotated-1.jpeg",
    "alt": "Open chrome wire shelving unit",
    "photoNote": "wire shelving with gear"
   },
   {
    "title": "Mobile wire shelving",
    "text": "Wire shelving on carriages for uniform, laundry, and supply rooms, combining the space savings of mobile storage with the airflow of open wire.",
    "model": "wire-track",
    "img": "assets/media/mfr/wire-shelving--4.jpg",
    "alt": "Rows of chrome wire shelving on mobile carriages",
    "photoNote": "mobile wire shelving"
   },
   {
    "title": "4-post shelving",
    "text": "Heavy-duty shelving for bulk supplies, boxed equipment, and off-season storage, built for a full season of use.",
    "model": "four-post",
    "img": "assets/media/2026/08/IMG_9310.jpeg",
    "alt": "Rows of blue 4-post steel shelving",
    "photoNote": "4-post shelving, off-season storage"
   },
   {
    "title": "Uniform storage",
    "text": "Garment rods, shelves, and cabinets that keep game and practice uniforms organized by sport, size, and number, so inventory is easy to count before and after the season.",
    "model": null,
    "img": "assets/media/2026/06/9dd25-textile-storage-1.jpg",
    "alt": "Garment rods above shelves and pull-out drawers",
    "photoNote": "uniform room"
   },
   {
    "title": "Secure personal lockers",
    "text": "Lockable storage for coaches, staff, and visiting teams, with keyed, combination, and electronic lock options.",
    "model": null,
    "img": "assets/guides/athletics/gov-personnel-lockers.jpg",
    "alt": "Rows of ventilated personal lockers",
    "photoNote": "staff and visiting team lockers"
   },
   {
    "title": "Recruiting-ready finishes",
    "text": "Branded end panels and team colors that turn the equipment room into a stop on the recruiting tour.",
    "model": null,
    "img": "assets/media/2026/06/80b31-corporate-storage-solutions.jpg",
    "alt": "Mobile storage with wood-finish end panels and handles",
    "photoNote": "branded end panels"
   },
   {
    "title": "Equipment workrooms",
    "text": "Casework, worktables, and cabinets for equipment repair, laundry, and coaches’ offices, designed with the storage so gear moves a short distance.",
    "model": null,
    "img": "assets/guides/athletics/edu-maintenance-shelving.jpg",
    "alt": "Workroom with shelving over drawer cabinets and a workbench",
    "photoNote": "equipment repair room"
   }
  ],
  "v3d": {
   "eyebrow": "Explore in 3D",
   "heading": "Open the lockers, move the carriages, see how it works",
   "sub": "Drag to turn a model, tap parts to open them, and pick another system from the list.",
   "tabs": [
    "Athletic Team Lockers",
    "High-Density Mobile Storage Install, Step by Step",
    "Wire Partition Enclosure",
    "Chrome Wire Shelving"
   ],
   "models": [
    "athletic",
    "install",
    "wire-cage",
    "wire-shelving"
   ]
  },
  "appsHeading": "Applications for every sport",
  "appsIntro": "Football, basketball, baseball, softball, lacrosse, hockey, soccer, wrestling, track and field, and more.",
  "apps": [
   {
    "title": "Team rooms",
    "items": [
     "Player lockers",
     "Helmets and pads",
     "Cleats and footwear",
     "Personal items",
     "Visiting team storage"
    ]
   },
   {
    "title": "Equipment rooms",
    "items": [
     "Balls and bags",
     "Training equipment",
     "Field equipment",
     "Off-season gear",
     "Replacement parts"
    ]
   },
   {
    "title": "Uniforms",
    "items": [
     "Game uniforms",
     "Practice gear",
     "Outerwear",
     "Inventory by size",
     "Laundry staging"
    ]
   },
   {
    "title": "Protective gear",
    "items": [
     "Helmets",
     "Shoulder pads",
     "Goalie gear",
     "Catcher’s gear",
     "Fitting and repair"
    ]
   },
   {
    "title": "Sticks and bats",
    "items": [
     "Lacrosse sticks",
     "Hockey sticks",
     "Field hockey sticks",
     "Bats",
     "Vaulting poles"
    ]
   },
   {
    "title": "Athletic training",
    "items": [
     "Taping supplies",
     "Braces and supports",
     "Rehab equipment",
     "Hydration supplies",
     "First aid supplies"
    ]
   },
   {
    "title": "Travel",
    "items": [
     "Team bags",
     "Road cases",
     "Video equipment",
     "Coolers",
     "Away-game staging"
    ]
   },
   {
    "title": "Facilities",
    "items": [
     "Grounds equipment",
     "Event supplies",
     "Concessions stock",
     "Signage and banners",
     "Records and files"
    ]
   }
  ],
  "gallery": [
   {
    "src": "assets/guides/athletics/hc-staff-lockers-lg.jpg",
    "alt": "Locker room with steel lockers and a bench"
   },
   {
    "src": "assets/media/mfr/education--2.jpg",
    "alt": "Equipment room shelving full of balls, bins and training gear"
   }
  ],
  "cta": {
   "heading": "Let’s look at your equipment room together",
   "text": "We’ll walk your team rooms and equipment areas, review your gear inventory with your staff, and lay out options that fit your space, program, and budget."
  }
 },
 {
  "slug": "automotive",
  "sheet": "Automotive Guide",
  "name": "Automotive",
  "title": "Automotive Parts Storage Guide",
  "sr": {
   "word": "parts de·part·ment",
   "pos": "n.",
   "old": "Aisles of shelves and a lot of walking.",
   "redefined": "Every part on hand, in its place, and quick to reach the counter."
  },
  "eyebrow": "Automotive parts and dealership storage",
  "headline": "Every part in its place",
  "tagline": "Improved organization. Improved access. Improved use of space.",
  "introHeading": "Better ways to store and find parts",
  "intro": [
   "Organization, access, and space: the right storage keeps parts secure, easy to find, and ready for the counter or the service bay. Every project starts with an on-site needs analysis. We review your parts inventory, look at your space and workflow, and design storage that fits your operation, from a single parts room to a full distribution center.",
   "We design, supply, and install, and we plan your layout around the bin locations in your dealer management system (DMS), so the physical storage matches your inventory records. Our own crews install automotive storage throughout the Philadelphia region and beyond, and we work with national automotive retailers on locations across the country. We work alongside your parts managers, service directors, facilities teams, architects, and general contractors from the first drawing."
  ],
  "cardsHeading": "Storage for every part of the operation",
  "hero": {
   "src": "assets/media/2026/06/9c210-obrien-automotive-banner.jpg",
   "alt": "Parts warehouse with rows of shelving and rack"
  },
  "introImg": {
   "src": "assets/media/2025/06/Automotive-Shelving.jpg",
   "alt": "Parts room with rows of blue steel shelving"
  },
  "cards": [
   {
    "title": "High-density mobile storage",
    "text": "Parts shelving mounted on carriages that glide along floor rails, so only the aisle you need is open. The same parts room can hold up to twice the inventory, and systems can be locked closed for added security.",
    "model": "install",
    "img": "assets/media/2026/06/d94ec-high-density-mobile-storage-2.jpg",
    "alt": "Mobile carriages with parts bins in an industrial space",
    "photoNote": "parts room on mobile carriages"
   },
   {
    "title": "Vertical lift modules",
    "text": "Enclosed towers that store small parts on trays and deliver them to the counter at the push of a button. Access controls and transaction tracking help secure and track high-value parts.",
    "model": "vlm",
    "img": "assets/guides/automotive/mh-vertical-lift-module.jpg",
    "alt": "Bank of vertical lift modules with an operator at the access openings",
    "photoNote": "vlm behind the parts counter"
   },
   {
    "title": "Vertical carousels",
    "text": "Rotating shelves inside an enclosed unit that bring parts to a comfortable working height, making the most of tall ceilings behind the parts counter.",
    "model": "vertical-carousel",
    "img": "assets/media/2026/06/7ec0c-lifts.jpg",
    "alt": "Enclosed vertical carousel units with open access windows",
    "photoNote": "vertical carousel"
   },
   {
    "title": "Tire racks",
    "text": "Purpose-built racks that organize bulky tire inventory by size, keeping tires off the floor and easy to pull.",
    "model": null,
    "img": "assets/media/2025/06/Tire-Rack.jpg",
    "alt": "Tires stored on blue steel tire racks",
    "photoNote": "tire storage racks"
   },
   {
    "title": "Parts shelving",
    "text": "Steel shelving with bin fronts, dividers, and labels for fast-moving parts, laid out to match the bin locations in your dealer management system (DMS).",
    "model": "four-post",
    "img": "assets/media/2025/06/Automotive-Shelving-2.jpg",
    "alt": "Blue 4-post parts shelving in a parts room",
    "photoNote": "4-post parts shelving"
   },
   {
    "title": "Modular drawer cabinets",
    "text": "Modular drawer cabinets with dividers for fasteners, filters, and electrical components, holding far more than open shelving in the same footprint.",
    "model": null,
    "img": "assets/guides/automotive/mh-shelving-drawers.jpg",
    "alt": "Modular drawer cabinets below parts shelving",
    "photoNote": "modular drawer cabinets"
   },
   {
    "title": "Long-part racks",
    "text": "Cantilever and vertical racks for exhaust pipes, trim, and other long or awkward parts, so they’re stored flat or upright instead of leaning in a corner.",
    "model": null,
    "img": "assets/media/2026/06/0ddac-pallet-rack.jpg",
    "alt": "Steel rack frames ready for long and bulky stock",
    "photoNote": "long-part storage"
   },
   {
    "title": "Pallet rack",
    "text": "Pallet rack for bulk fluids, batteries, and boxed inventory in receiving and back-stock areas.",
    "model": null,
    "img": "assets/guides/automotive/mh-pallet-rack.jpg",
    "alt": "Pallet rack being installed in a back-stock area",
    "photoNote": "pallet rack in back stock"
   },
   {
    "title": "Mezzanines",
    "text": "Mezzanines that add a second level of parts storage above the existing floor, without adding on to the building.",
    "model": null,
    "img": "assets/guides/automotive/mh-warehouse-mezzanine.jpg",
    "alt": "Steel mezzanine with stairs over a stocked storage floor",
    "photoNote": "parts mezzanine"
   },
   {
    "title": "Secure parts cages",
    "text": "Lockable wire partitions for high-value parts, catalytic converters, and special orders, with clear sight lines and airflow.",
    "model": "wire-cage",
    "img": "assets/guides/automotive/mh-wire-partitions.jpg",
    "alt": "Wire partition enclosure inside a stockroom",
    "photoNote": "wire partition parts cage"
   },
   {
    "title": "Parts pickup lockers",
    "text": "Smart lockers that let customers and technicians pick up parts and special orders after hours, with compartments assigned and tracked electronically.",
    "model": "smart-lockers",
    "img": "assets/media/2026/06/b9be5-smart-locker-brochure-e1777571764125.jpeg",
    "alt": "Wall of smart lockers with a touchscreen",
    "photoNote": "parts pickup lockers"
   },
   {
    "title": "Technician and shop storage",
    "text": "Personal lockers, worktables, and modular casework for technicians, service advisors, and shop offices, designed with the storage so parts travel a short distance.",
    "model": null,
    "img": "assets/guides/automotive/mh-shop-mezzanine.jpg",
    "alt": "Service shop with storage cabinets, a lift and a mezzanine",
    "photoNote": "service department"
   }
  ],
  "v3d": {
   "eyebrow": "Explore in 3D",
   "heading": "Open the trays, move the carriages, see how it works",
   "sub": "Drag to turn a model, tap parts to open them, and pick another system from the list.",
   "tabs": [
    "Vertical Lift Module (VLM)",
    "Vertical Carousel",
    "High-Density Mobile Storage Install, Step by Step",
    "4-Post Steel Shelving",
    "Wire Partition Enclosure",
    "Smart Package Lockers"
   ],
   "models": [
    "vlm",
    "vertical-carousel",
    "install",
    "four-post",
    "wire-cage",
    "smart-lockers"
   ]
  },
  "appsHeading": "Applications for every parts operation",
  "appsIntro": "Dealerships, independent repair shops, collision centers, fleet maintenance, parts distributors, and national automotive retailers.",
  "apps": [
   {
    "title": "Parts counter",
    "items": [
     "Fast-moving parts",
     "Special orders",
     "Customer pickup",
     "Small parts",
     "Returns"
    ]
   },
   {
    "title": "Small parts",
    "items": [
     "Fasteners",
     "Filters",
     "Electrical components",
     "Gaskets and seals",
     "Bulbs and fuses"
    ]
   },
   {
    "title": "Bulky parts",
    "items": [
     "Bumpers and body panels",
     "Exhaust components",
     "Brake rotors",
     "Batteries",
     "Boxed parts"
    ]
   },
   {
    "title": "Tires and wheels",
    "items": [
     "Passenger tires",
     "Light truck tires",
     "Wheels",
     "Seasonal tire storage",
     "Customer tire storage"
    ]
   },
   {
    "title": "Fluids and supplies",
    "items": [
     "Oil and fluids",
     "Coolant",
     "Lubricants",
     "Shop chemicals",
     "Cleaning supplies"
    ]
   },
   {
    "title": "Service and shop",
    "items": [
     "Technician tools",
     "Diagnostic equipment",
     "Shop supplies",
     "Uniforms",
     "Personal lockers"
    ]
   },
   {
    "title": "Secure storage",
    "items": [
     "Catalytic converters",
     "Keys",
     "High-value parts",
     "Electronics",
     "Warranty returns"
    ]
   },
   {
    "title": "Records and admin",
    "items": [
     "Repair orders",
     "Deal files",
     "Title and registration records",
     "Office supplies",
     "Archives"
    ]
   }
  ],
  "gallery": [
   {
    "src": "assets/media/2025/06/Automotive-Shelving-3.jpg",
    "alt": "Blue parts shelving installed in a parts department"
   },
   {
    "src": "assets/media/mfr/automotive--1.jpg",
    "alt": "Multi-level parts storage with shelving and a catwalk"
   }
  ],
  "cta": {
   "heading": "Let’s look at your parts room together",
   "text": "We’ll walk your parts department and storage areas, review your inventory with your team, and lay out options that fit your space, workflow, and budget."
  }
 },
 {
  "slug": "libraries",
  "sheet": "Libraries Guide",
  "name": "Libraries",
  "title": "Library Storage Guide",
  "sr": {
   "word": "li·brar·y",
   "pos": "n.",
   "old": "A building full of books.",
   "redefined": "A community space that still has room for the whole collection."
  },
  "eyebrow": "Library and archive storage",
  "headline": "Room for the collection and the community",
  "tagline": "Improved access. Improved capacity. Improved use of space.",
  "introHeading": "Better ways to store and share a collection",
  "intro": [
   "Access, capacity, and space: the right storage keeps a collection easy to browse, well cared for, and ready to grow. Every project starts with an on-site needs analysis. We review your collection, look at your space and how patrons and staff use it, and design storage that fits your library, from a single reading room to a full library building.",
   "We design, supply, and install, and our own crews install library storage throughout the Philadelphia region and beyond. Book stacks are heavy, so we provide complete loading data and work with your facilities team, architects, and structural engineer before anything is ordered. We work alongside your librarians, archivists, and administrators from the first drawing."
  ],
  "cardsHeading": "Storage for every part of the library",
  "hero": {
   "src": "assets/media/mfr/libraries--2.jpeg",
   "alt": "Library with stacks, reading seating and a glass-walled room"
  },
  "introImg": {
   "src": "assets/media/2026/06/c382a-lancaster2.jpg",
   "alt": "Library stacks beside study tables"
  },
  "cards": [
   {
    "title": "Cantilever library shelving",
    "text": "Classic browsable stacks with no front posts in the way, so books stay front and center. Re-shelving is easy, and finished end panels and canopy tops give the stacks a furniture-quality look.",
    "model": "library",
    "img": "assets/guides/libraries/edu-library-books.jpg",
    "alt": "Cantilever library shelving with finished end panels",
    "photoNote": "open stacks, cantilever shelving"
   },
   {
    "title": "High-density mobile storage",
    "text": "Shelving mounted on carriages that glide along floor rails, so only the aisle you need is open. The same room can hold up to twice the collection, freeing up floor space for seating, study areas, and educational programs.",
    "model": "install",
    "img": "assets/guides/libraries/edu-high-density-library.jpg",
    "alt": "High-density mobile shelving holding library books",
    "photoNote": "mobile shelving in the stacks"
   },
   {
    "title": "Closed stacks and remote storage",
    "text": "High-density mobile storage and 4-post shelving for closed stacks, overflow, and remote storage, so materials stay in the collection without taking up public floor space.",
    "model": null,
    "img": "assets/guides/libraries/edu-library-stacks.jpg",
    "alt": "Narrow aisle of closed stacks filled with bound volumes",
    "photoNote": "closed stacks"
   },
   {
    "title": "Archives and special collections",
    "text": "Closed-stack and conservation-grade options for rare books, manuscripts, and special collections, including steel cabinets with gasketed doors that help protect against dust and pests.",
    "model": null,
    "img": "assets/guides/libraries/mus-preservation-cabinet-trays.jpg",
    "alt": "Steel cabinet with gasketed doors open to pull-out trays",
    "photoNote": "special collections room"
   },
   {
    "title": "Flat files and map cases",
    "text": "Flat file cabinets with full-extension drawers for maps, prints, photographs, posters, and oversized materials.",
    "model": "flat-files",
    "img": "assets/guides/libraries/gov-flat-files.jpg",
    "alt": "Stacked flat file cabinets",
    "photoNote": "flat file cabinets"
   },
   {
    "title": "Media and periodical storage",
    "text": "Shelving and display options for DVDs, audiobooks, magazines, and newspapers, sized to the materials and easy to browse.",
    "model": null,
    "img": "assets/media/mfr/libraries--1.jpg",
    "alt": "Shelving and display units holding magazines and media",
    "photoNote": "media shelving"
   },
   {
    "title": "Children’s and school library shelving",
    "text": "Lower-height shelving, picture book bins, and end-panel finishes for children’s areas and school libraries.",
    "model": null,
    "img": "assets/media/mfr/education--3.jpg",
    "alt": "Children’s library area with low shelving and a reading table",
    "photoNote": "children’s area"
   },
   {
    "title": "Archive and records shelving",
    "text": "4-post shelving sized to archival and records boxes, for library archives, local history collections, and administrative records.",
    "model": "four-post",
    "img": "assets/guides/libraries/gov-archival-box-shelving.jpg",
    "alt": "4-post shelving holding archival boxes",
    "photoNote": "4-post archive shelving"
   },
   {
    "title": "Rotary cabinets",
    "text": "Rotary cabinets that store files, media, and supplies on both sides of a rotating unit, for staff workrooms and circulation areas.",
    "model": "rotary",
    "img": "assets/media/2026/06/7f9df-rotary-file-cabinets-1.jpg",
    "alt": "Open rotary cabinet with files and media on its shelves",
    "photoNote": "rotary cabinet"
   },
   {
    "title": "Fire-rated cabinets",
    "text": "Fire-rated cabinets for irreplaceable records and materials, rated to industry standards.",
    "model": "fireproof",
    "img": "assets/guides/libraries/gov-secure-cabinets.jpg",
    "alt": "Tall steel cabinets with locking handles",
    "photoNote": "fire-rated cabinets"
   },
   {
    "title": "Holds pickup lockers",
    "text": "Smart lockers that let patrons pick up holds and borrowed equipment on their own schedule, with compartments assigned and tracked electronically.",
    "model": "smart-lockers",
    "img": "assets/media/2025/10/NEW-OCS-Smart-Brochure.jpeg",
    "alt": "Hand entering a code on a smart locker keypad",
    "photoNote": "holds pickup lockers"
   },
   {
    "title": "Staff workrooms",
    "text": "Worktables, carts, shelving, and modular casework for technical services, processing, and staff workrooms, designed with the storage so materials move a short distance.",
    "model": null,
    "img": "assets/guides/libraries/corp-workroom.jpg",
    "alt": "Staff workroom with casework, worktables and storage",
    "photoNote": "technical services workroom"
   }
  ],
  "v3d": {
   "eyebrow": "Explore in 3D",
   "heading": "Move the carriages, open the drawers, see how it works",
   "sub": "Drag to turn a model, tap parts to open them, and pick another system from the list.",
   "tabs": [
    "Cantilever Library Shelving",
    "High-Density Mobile Storage Install, Step by Step",
    "Flat File Cabinets",
    "Rotary File Cabinet",
    "Fire-Rated File Cabinets",
    "Smart Package Lockers"
   ],
   "models": [
    "library",
    "install",
    "flat-files",
    "rotary",
    "fireproof",
    "smart-lockers"
   ]
  },
  "appsHeading": "Applications for every library",
  "appsIntro": "Public, academic, school, law, medical, and special libraries, plus archives and historical societies.",
  "apps": [
   {
    "title": "Open stacks",
    "items": [
     "Circulating books",
     "Reference",
     "Large print",
     "New releases",
     "Browsing collections"
    ]
   },
   {
    "title": "Closed stacks",
    "items": [
     "Overflow collections",
     "Low-use materials",
     "Bound periodicals",
     "Government documents",
     "Remote storage"
    ]
   },
   {
    "title": "Special collections",
    "items": [
     "Rare books",
     "Manuscripts",
     "Local history",
     "Photographs",
     "Maps"
    ]
   },
   {
    "title": "Children and teens",
    "items": [
     "Picture books",
     "Board books",
     "Graphic novels",
     "Young adult",
     "Story time supplies"
    ]
   },
   {
    "title": "Media",
    "items": [
     "DVDs and Blu-rays",
     "Audiobooks",
     "Music",
     "Video games",
     "Library of things"
    ]
   },
   {
    "title": "Periodicals",
    "items": [
     "Magazines",
     "Newspapers",
     "Journals",
     "Back issues",
     "Microfilm"
    ]
   },
   {
    "title": "Archives and records",
    "items": [
     "Archival boxes",
     "Institutional records",
     "Oversized documents",
     "Board minutes",
     "Digitization staging"
    ]
   },
   {
    "title": "Staff and operations",
    "items": [
     "Holds and returns",
     "Book carts",
     "Processing supplies",
     "Program supplies",
     "Equipment"
    ]
   }
  ],
  "gallery": [
   {
    "src": "assets/guides/libraries/edu-library-floor-lg.jpg",
    "alt": "Curved run of open library stacks"
   },
   {
    "src": "assets/media/mfr/libraries--3.jpg",
    "alt": "High-density mobile shelving holding bound volumes"
   }
  ],
  "cta": {
   "heading": "Let’s look at your library together",
   "text": "We’ll walk your stacks and storage areas, review the collection with your team, and lay out options that fit your space, collection, and budget."
  }
 },
 {
  "slug": "government-public-safety",
  "sheet": "Government Guide",
  "name": "Government & Public Safety",
  "title": "Government & Public Safety Storage Guide",
  "sr": {
   "word": "ev·i·dence room",
   "pos": "n.",
   "old": "Shelves, boxes, and a sign-out sheet.",
   "redefined": "Every item logged, secured, and ready when the case is."
  },
  "eyebrow": "Government and public safety storage",
  "headline": "Built for accountability",
  "tagline": "Improved security. Improved accountability. Improved use of space.",
  "introHeading": "Better ways to store, secure, and track",
  "intro": [
   "Security, accountability, and space: the right storage keeps evidence, records, and gear secure, easy to find, and ready to audit. Every project starts with an on-site needs analysis. We review your inventory, intake volume, and retention schedules, look at your space and security needs, and design storage that fits your agency, from a single evidence room to a full public safety building.",
   "We design, supply, and install, and our own crews complete background checks and any other clearances each job requires. They’re experienced working inside secure facilities throughout the Philadelphia region and beyond. O’Brien Systems is a Commonwealth of Pennsylvania Small Business (SB) certified vendor, and many of the manufacturers we work with hold GSA contracts, so we can offer purchasing through their GSA schedules where it applies."
  ],
  "cardsHeading": "Storage for every part of the agency",
  "hero": {
   "src": "assets/media/mfr/evidence-lockers--1.jpg",
   "alt": "Evidence intake room with a wall of evidence lockers"
  },
  "introImg": {
   "src": "assets/media/2026/03/IMG_4533-scaled.jpg",
   "alt": "Evidence room with high-density mobile shelving holding evidence boxes"
  },
  "cards": [
   {
    "title": "Pass-through evidence lockers",
    "text": "Officers deposit evidence through the front, and the door locks behind them. Only the evidence custodian can open the compartment from the rear, and electronic locks log every deposit and retrieval.",
    "model": "evidence-lockers",
    "img": "assets/media/mfr/evidence-lockers--2.jpg",
    "alt": "Evidence lockers in mixed compartment sizes",
    "photoNote": "evidence intake lockers"
   },
   {
    "title": "Refrigerated evidence lockers",
    "text": "Cold storage compartments for biological evidence, built into the same intake system as your other evidence lockers.",
    "model": null,
    "img": "assets/media/mfr/evidence-lockers--4.jpg",
    "alt": "Bank of evidence lockers with electronic locks",
    "photoNote": "refrigerated evidence lockers"
   },
   {
    "title": "Evidence intake rooms",
    "text": "Intake rooms designed as a complete system, with a mix of locker sizes for phones, firearms, and bulky items, plus packaging stations and the long-term storage behind them.",
    "model": null,
    "img": "assets/media/mfr/evidence-lockers--5.jpg",
    "alt": "Evidence intake room with a packaging station and lockers",
    "photoNote": "evidence intake room"
   },
   {
    "title": "High-density mobile storage",
    "text": "Evidence and records shelving mounted on carriages that glide along floor rails, so only the aisle you need is open. The same room can hold up to twice as much, and systems can be locked closed for added security.",
    "model": "install",
    "img": "assets/guides/government-public-safety/gov-mobile-shelving-aisle.jpg",
    "alt": "Open aisle in a high-density mobile shelving system",
    "photoNote": "evidence room on mobile carriages"
   },
   {
    "title": "Secure evidence cages",
    "text": "Lockable wire partitions for drugs, firearms, money, and high-value evidence, with clear sight lines and airflow inside a secure perimeter.",
    "model": "wire-cage",
    "img": "assets/guides/government-public-safety/ps-wire-cages.jpg",
    "alt": "Row of lockable wire mesh cages",
    "photoNote": "wire partition evidence cage"
   },
   {
    "title": "Bulk evidence storage",
    "text": "4-post shelving and pallet rack for bicycles, large items, and bulk evidence, organized so every item is easy to find and audit.",
    "model": null,
    "img": "assets/media/2026/06/37162-evidence.jpg",
    "alt": "Shelving holding labeled evidence totes",
    "photoNote": "bulk evidence storage"
   },
   {
    "title": "Weapons storage and armories",
    "text": "Weapon racks and cabinets with adjustable cradles for long guns, drawers for sidearms and optics, and locking options from key control to electronic access with full audit trails.",
    "model": "weapons",
    "img": "assets/guides/government-public-safety/ps-long-gun-storage.jpg",
    "alt": "Armory wall with racks for long guns and sidearms",
    "photoNote": "armory"
   },
   {
    "title": "Gear lockers",
    "text": "Personal and gear lockers that keep officer equipment ready and accounted for, in locker rooms, ready rooms, and patrol staging areas.",
    "model": null,
    "img": "assets/guides/government-public-safety/ps-duty-lockers.jpg",
    "alt": "Room of ventilated duty lockers",
    "photoNote": "officer gear lockers"
   },
   {
    "title": "Records storage",
    "text": "High-density mobile storage, rotary cabinets, and 4-post shelving sized to your retention schedules, for case files, court records, and administrative records.",
    "model": null,
    "img": "assets/guides/government-public-safety/gov-records-aisle.jpg",
    "alt": "Aisle of records shelving holding file boxes",
    "photoNote": "records room"
   },
   {
    "title": "Fire-rated cabinets",
    "text": "Fire-rated cabinets for vital records and irreplaceable documents, rated to industry standards.",
    "model": "fireproof",
    "img": "assets/guides/government-public-safety/gov-secure-cabinets.jpg",
    "alt": "Tall steel cabinets with locking handles",
    "photoNote": "fire-rated cabinets"
   },
   {
    "title": "Smart lockers",
    "text": "Smart lockers for shared equipment, radios, and property release, with compartments assigned, unlocked, and tracked electronically.",
    "model": "smart-lockers",
    "img": "assets/media/2026/06/b9be5-smart-locker-brochure-e1777571764125.jpeg",
    "alt": "Wall of smart lockers with a touchscreen",
    "photoNote": "smart lockers"
   },
   {
    "title": "Uniform and supply storage",
    "text": "Wardrobe and uniform cabinets, shelving, and bins for uniforms, supplies, and quartermaster storage.",
    "model": "wardrobe",
    "img": "assets/guides/government-public-safety/ps-ventilated-cabinets.jpg",
    "alt": "Ventilated steel cabinets for uniforms and gear",
    "photoNote": "uniform cabinets"
   }
  ],
  "v3d": {
   "eyebrow": "Explore in 3D",
   "heading": "Open the lockers, move the carriages, see how it works",
   "sub": "Drag to turn a model, tap parts to open them, and pick another system from the list.",
   "tabs": [
    "Pass-Through Evidence Lockers",
    "High-Density Mobile Storage Install, Step by Step",
    "Weapons Storage Cabinet",
    "Wire Partition Enclosure",
    "Fire-Rated File Cabinets",
    "Smart Package Lockers"
   ],
   "models": [
    "evidence-lockers",
    "install",
    "weapons",
    "wire-cage",
    "fireproof",
    "smart-lockers"
   ]
  },
  "appsHeading": "Applications for every agency",
  "appsIntro": "Police departments, sheriff’s offices, district attorneys, courts, crime labs, correctional facilities, fire and EMS, and municipal, county, and state government.",
  "apps": [
   {
    "title": "Evidence intake",
    "items": [
     "Phones and electronics",
     "Firearms",
     "Drugs and narcotics",
     "Bulky items",
     "Biological evidence"
    ]
   },
   {
    "title": "Long-term evidence",
    "items": [
     "Case evidence",
     "Cold case files",
     "Bicycles and large items",
     "Money and valuables",
     "Found property"
    ]
   },
   {
    "title": "Armory",
    "items": [
     "Long guns",
     "Sidearms",
     "Optics",
     "Less-lethal equipment",
     "Ammunition"
    ]
   },
   {
    "title": "Officer gear",
    "items": [
     "Duty gear",
     "Body armor",
     "Radios",
     "Body-worn cameras",
     "Tactical equipment"
    ]
   },
   {
    "title": "Records",
    "items": [
     "Case files",
     "Court records",
     "Personnel files",
     "Permits and licenses",
     "Archives"
    ]
   },
   {
    "title": "Uniforms and supplies",
    "items": [
     "Uniforms",
     "Quartermaster stock",
     "Office supplies",
     "Forms",
     "Training materials"
    ]
   },
   {
    "title": "Fire and EMS",
    "items": [
     "Turnout gear",
     "Medical supplies",
     "Rescue equipment",
     "Station equipment",
     "Personal lockers"
    ]
   },
   {
    "title": "Facilities and fleet",
    "items": [
     "Fleet parts",
     "Maintenance tools",
     "Public works supplies",
     "Traffic control equipment",
     "Emergency supplies"
    ]
   }
  ],
  "gallery": [
   {
    "src": "assets/guides/government-public-safety/ps-evidence-long-gun-lg.jpg",
    "alt": "Evidence storage with racks for long guns"
   },
   {
    "src": "assets/guides/government-public-safety/ps-handgun-storage-lg.jpg",
    "alt": "Armory wall with handgun racks"
   }
  ],
  "cta": {
   "heading": "Let’s look at your space together",
   "text": "We’ll walk your evidence, records, and storage areas, review your inventory with your team, and lay out options that fit your space, procedures, and budget."
  }
 },
 {
  "slug": "corporate-legal",
  "sheet": "Corporate & Legal Guide",
  "name": "Corporate & Legal",
  "title": "Corporate & Legal Storage Guide",
  "sr": {
   "word": "of·fice",
   "pos": "n.",
   "old": "Desks, file cabinets, and whatever’s left over.",
   "redefined": "A workplace where every file, package, and person has a place."
  },
  "eyebrow": "Corporate and legal storage",
  "headline": "Organized for the way you work",
  "tagline": "Improved organization. Improved security. Improved use of space.",
  "introHeading": "Better ways to store and find information",
  "intro": [
   "Organization, security, and space: the right storage keeps files secure, easy to find, and close to the people who need them. Every project starts with an on-site needs analysis. We review your records and retention requirements, look at your space and how your teams work, and design storage that fits your office, from a single file room to a full corporate headquarters.",
   "We design, supply, and install, and our own crews install office storage throughout the Philadelphia region and beyond. When offices move or consolidate, our crews move the records too, keeping files in order from the old space to the new one. We work alongside your records managers, office and facilities managers, IT teams, architects, and general contractors from the first drawing."
  ],
  "cardsHeading": "Storage for every part of the office",
  "hero": {
   "src": "assets/guides/corporate-legal/corp-high-density-filing-lg.jpg",
   "alt": "High-density filing aisle with color-coded files"
  },
  "introImg": {
   "src": "assets/guides/corporate-legal/corp-mobile-file-storage-lg.jpg",
   "alt": "Closed high-density file storage in an office"
  },
  "cards": [
   {
    "title": "High-density mobile storage",
    "text": "File shelving mounted on carriages that glide along floor rails, so only the aisle you need is open. A records room can fit into up to half the space, and systems can be locked closed for added security.",
    "model": "install",
    "img": "assets/media/2022/06/Corp-Archival-Storage.jpg",
    "alt": "Records room on mobile carriages with an open aisle",
    "photoNote": "records room on mobile carriages"
   },
   {
    "title": "Rotary cabinets",
    "text": "Two cabinets in one footprint, with shelving on both sides of a rotating core. A quarter turn closes the unit into a locked steel cabinet after hours.",
    "model": "rotary",
    "img": "assets/media/2026/06/29f0a-rotary-file-cabinet.jpg",
    "alt": "Row of rotary cabinets in an office, one turned open",
    "photoNote": "rotary file cabinets"
   },
   {
    "title": "Lateral file cabinets",
    "text": "Lateral files that keep active files organized right where people work, in letter and legal sizes.",
    "model": null,
    "img": "assets/media/2026/06/e434c-cabinets-corporate.jpg",
    "alt": "Office file cabinets and shelving beside a work area",
    "photoNote": "lateral files in an office"
   },
   {
    "title": "Archive and box storage",
    "text": "4-post shelving sized to records boxes for archives, closed files, and retention storage, labeled so every box is easy to find.",
    "model": "four-post",
    "img": "assets/guides/corporate-legal/gov-archive-shelving.jpg",
    "alt": "Shelving holding labeled record boxes",
    "photoNote": "archive box shelving"
   },
   {
    "title": "Fire-rated cabinets",
    "text": "Fire-rated cabinets for contracts, deeds, and vital records, rated to industry standards.",
    "model": "fireproof",
    "img": "assets/guides/corporate-legal/gov-secure-cabinets.jpg",
    "alt": "Tall steel cabinets with locking handles",
    "photoNote": "fire-rated cabinets"
   },
   {
    "title": "Smart lockers",
    "text": "Smart lockers for day-use storage, package delivery, and shared equipment in hybrid workplaces, with compartments assigned, unlocked, and tracked electronically.",
    "model": "smart-lockers",
    "img": "assets/media/2026/06/994db-agile-lockers-workplace-lockers-1536x1024.jpg",
    "alt": "Wood-finish day-use lockers in an open office",
    "photoNote": "smart lockers in an office"
   },
   {
    "title": "Personal lockers",
    "text": "Personal lockers for staff, visitors, and touchdown workspaces, with keyed, combination, and electronic lock options.",
    "model": null,
    "img": "assets/guides/corporate-legal/corp-office-lockers.jpg",
    "alt": "White personal lockers in an office",
    "photoNote": "personal lockers"
   },
   {
    "title": "Mail sorters and mailroom",
    "text": "Sort modules, consoles, and mailroom casework sized to your daily volume, with adjustable pockets that resize and relabel as departments change.",
    "model": null,
    "img": "assets/guides/corporate-legal/corp-mail-center.jpg",
    "alt": "Mail center with sort modules along the walls",
    "photoNote": "mailroom"
   },
   {
    "title": "Modular casework",
    "text": "Modular casework for copy rooms, supply rooms, and break rooms, designed to adapt as your office changes.",
    "model": null,
    "img": "assets/guides/corporate-legal/corp-copy-room-casework.jpg",
    "alt": "Copy room with modular casework and a copier",
    "photoNote": "copy and supply room"
   },
   {
    "title": "Supply and IT storage",
    "text": "Wire and steel shelving for office supplies, IT equipment, and spare parts, with open designs that keep inventory visible.",
    "model": "four-post",
    "img": "assets/media/2026/06/74e6c-boxedge_open-shelving-1-1200x963.jpg",
    "alt": "Rows of open steel shelving units",
    "photoNote": "supply room shelving"
   },
   {
    "title": "Secure IT cages",
    "text": "Lockable wire partitions for server rooms, IT equipment, and tenant storage, with clear sight lines and airflow.",
    "model": "wire-cage",
    "img": "assets/guides/corporate-legal/mh-wire-partitions.jpg",
    "alt": "Wire partition enclosure with a door",
    "photoNote": "wire partition it cage"
   },
   {
    "title": "Office relocations",
    "text": "Moves and reinstalls that keep your files in order, from packing the records to setting up storage in the new space.",
    "model": null,
    "img": "assets/media/2026/06/89080-services.jpg",
    "alt": "Two installers reviewing a storage installation",
    "photoNote": "office move"
   }
  ],
  "v3d": {
   "eyebrow": "Explore in 3D",
   "heading": "Turn the cabinets, move the carriages, see how it works",
   "sub": "Drag to turn a model, tap parts to open them, and pick another system from the list.",
   "tabs": [
    "Rotary File Cabinet",
    "High-Density Mobile Storage Install, Step by Step",
    "Fire-Rated File Cabinets",
    "Smart Package Lockers",
    "4-Post Steel Shelving",
    "Wire Partition Enclosure"
   ],
   "models": [
    "rotary",
    "install",
    "fireproof",
    "smart-lockers",
    "four-post",
    "wire-cage"
   ]
  },
  "appsHeading": "Applications for every office",
  "appsIntro": "Law firms, corporate offices, financial services, insurance, accounting firms, title companies, and nonprofits.",
  "apps": [
   {
    "title": "Active files",
    "items": [
     "Case files",
     "Client files",
     "Contracts",
     "Binders",
     "Working papers"
    ]
   },
   {
    "title": "Records and archives",
    "items": [
     "Closed files",
     "Retention boxes",
     "Board records",
     "Tax records",
     "Historical records"
    ]
   },
   {
    "title": "HR and confidential",
    "items": [
     "Personnel files",
     "Payroll records",
     "Benefits records",
     "Medical files",
     "Legal holds"
    ]
   },
   {
    "title": "Law library",
    "items": [
     "Reporters and codes",
     "Practice guides",
     "Treatises",
     "Periodicals",
     "Reference"
    ]
   },
   {
    "title": "Mailroom",
    "items": [
     "Incoming mail",
     "Interoffice mail",
     "Packages",
     "Shipping supplies",
     "Courier pickups"
    ]
   },
   {
    "title": "Workplace",
    "items": [
     "Day-use lockers",
     "Personal items",
     "Coats and bags",
     "Shared equipment",
     "Laptops"
    ]
   },
   {
    "title": "Supply and copy rooms",
    "items": [
     "Paper and toner",
     "Office supplies",
     "Marketing materials",
     "Forms",
     "Break room supplies"
    ]
   },
   {
    "title": "IT and facilities",
    "items": [
     "Servers and network equipment",
     "Spare hardware",
     "Tools",
     "Furniture parts",
     "Facilities records"
    ]
   }
  ],
  "gallery": [
   {
    "src": "assets/media/2026/06/362de-corp-archival-storage.jpg",
    "alt": "Office file room with mobile shelving and record boxes"
   },
   {
    "src": "assets/media/mfr/mail-sorters--1.jpg",
    "alt": "Mailroom with sorting pockets above casework"
   }
  ],
  "cta": {
   "heading": "Let’s look at your office together",
   "text": "We’ll walk your file rooms and storage areas, review your records with your team, and lay out options that fit your space, workflow, and budget."
  }
 },
 {
  "slug": "education",
  "sheet": "Education Guide",
  "name": "Education",
  "title": "School & Campus Storage Guide",
  "sr": {
   "word": "class·room",
   "pos": "n.",
   "old": "Four walls, desks, and a supply closet.",
   "redefined": "A learning space where every lesson’s materials have a place."
  },
  "eyebrow": "School and campus storage",
  "headline": "Ready before the first bell",
  "tagline": "Improved organization. Improved access. Improved use of space.",
  "introHeading": "Better ways to store and organize a school",
  "intro": [
   "Organization, access, and space: the right storage keeps materials organized, easy to reach, and ready for the next lesson. Every project starts with an on-site needs analysis. We review what each department stores, look at your rooms and how they’re used, and design storage building by building and room by room, from a single classroom to a full campus.",
   "We design, supply, and install, and summer is install season. We schedule deliveries and our own crews around the academic calendar so rooms are ready before students return. We work with schools, colleges, and universities throughout the Philadelphia region and beyond, alongside your facilities directors, business offices, architects, and general contractors."
  ],
  "cardsHeading": "Storage for every part of the school",
  "hero": {
   "src": "assets/media/mfr/education--1.jpg",
   "alt": "Classroom with casework, whiteboards and a mobile display unit"
  },
  "introImg": {
   "src": "assets/media/2026/06/c4d30-casework-2048x1536.jpg",
   "alt": "Learning space with casework, shelving and students at work"
  },
  "cards": [
   {
    "title": "Textbook and supply rooms",
    "text": "Adjustable 4-post shelving for textbooks, curriculum materials, and supplies, easy to reconfigure each year as courses change.",
    "model": "four-post",
    "img": "assets/media/2026/06/boxedge_open-shelving-1.jpg",
    "alt": "Rows of adjustable steel shelving units",
    "photoNote": "textbook room"
   },
   {
    "title": "Classroom casework",
    "text": "Modular laminate casework for classrooms and prep rooms, with units that move and reconfigure when programs change.",
    "model": null,
    "img": "assets/media/2026/06/b44f0-edu-modular.jpg",
    "alt": "Classroom casework with open bins and storage",
    "photoNote": "classroom casework"
   },
   {
    "title": "Science labs and prep rooms",
    "text": "Steel casework and lab furniture with chemical-resistant work surfaces for science classrooms and prep rooms.",
    "model": "casework",
    "img": "assets/media/mfr/modular-casework--2.jpg",
    "alt": "Science classroom with lab tables and perimeter casework",
    "photoNote": "science lab"
   },
   {
    "title": "School libraries",
    "text": "Cantilever library shelving for open, browsable stacks that are easy to reconfigure as collections and spaces change.",
    "model": "library",
    "img": "assets/media/2026/06/24a10-education-static-shelving.jpg",
    "alt": "School library shelving with labeled end panels",
    "photoNote": "school library"
   },
   {
    "title": "High-density mobile storage",
    "text": "Shelving mounted on carriages that glide along floor rails, giving registrars and district offices up to twice the records storage in the same space, without new construction.",
    "model": "install",
    "img": "assets/media/2026/06/ad053-kevino-photo2.jpg",
    "alt": "Long aisle of high-density mobile shelving",
    "photoNote": "records room on mobile carriages"
   },
   {
    "title": "Student and staff lockers",
    "text": "Hallway and staff lockers with keyed, combination, and electronic lock options, built to stand up to daily student use.",
    "model": null,
    "img": "assets/media/2026/06/1cf43-edu-lockers.jpg",
    "alt": "Hallway lockers in a school",
    "photoNote": "hallway lockers"
   },
   {
    "title": "Athletic lockers and equipment",
    "text": "Ventilated team room lockers and equipment storage for athletics programs, with high-density mobile storage for gear rooms.",
    "model": "athletic",
    "img": "assets/guides/education/edu-locker-room.jpg",
    "alt": "Team room with ventilated steel lockers and a bench",
    "photoNote": "team room"
   },
   {
    "title": "Music and band rooms",
    "text": "Instrument storage cabinets and shelving for band and orchestra rooms, sized to the instruments they hold.",
    "model": null,
    "img": "assets/media/2026/06/08189-edu-cabinets.jpg",
    "alt": "Instrument storage cabinet beside a cello",
    "photoNote": "band room"
   },
   {
    "title": "Art rooms and makerspaces",
    "text": "Flat files, shelving, and casework for art rooms and makerspaces, with drawers for paper and projects in progress.",
    "model": "flat-files",
    "img": "assets/guides/education/corp-flat-file-cabinets.jpg",
    "alt": "Flat file cabinet with a drawer open to large drawings",
    "photoNote": "art room"
   },
   {
    "title": "Wardrobe and uniform cabinets",
    "text": "Wardrobe cabinets for costumes, band uniforms, and staff coats, with full-height hanging space and lock options.",
    "model": "wardrobe",
    "img": "assets/guides/education/ps-ventilated-cabinets.jpg",
    "alt": "Ventilated steel wardrobe cabinets",
    "photoNote": "wardrobe cabinets"
   },
   {
    "title": "Smart lockers",
    "text": "Smart lockers for laptop and device distribution, package delivery, and shared equipment, with compartments assigned and tracked electronically.",
    "model": "smart-lockers",
    "img": "assets/media/2026/06/b9be5-smart-locker-brochure-e1777571764125.jpeg",
    "alt": "Wall of smart lockers with a touchscreen",
    "photoNote": "device lockers"
   },
   {
    "title": "Facilities and maintenance",
    "text": "Shelving, bin storage, and wire partitions for custodial supplies, maintenance parts, and facilities equipment.",
    "model": "bin-shelving",
    "img": "assets/guides/education/edu-maintenance-shelving.jpg",
    "alt": "Maintenance shop shelving over drawer cabinets",
    "photoNote": "maintenance storage"
   }
  ],
  "v3d": {
   "eyebrow": "Explore in 3D",
   "heading": "Adjust the shelves, move the carriages, see how it works",
   "sub": "Drag to turn a model, tap parts to open them, and pick another system from the list.",
   "tabs": [
    "4-Post Steel Shelving",
    "Cantilever Library Shelving",
    "Modular Lab Casework",
    "High-Density Mobile Storage Install, Step by Step",
    "Athletic Team Lockers",
    "Steel Wardrobe Cabinets"
   ],
   "models": [
    "four-post",
    "library",
    "casework",
    "install",
    "athletic",
    "wardrobe"
   ]
  },
  "appsHeading": "Applications for every school",
  "appsIntro": "Public and private K–12 schools, charter schools, school districts, colleges, and universities.",
  "apps": [
   {
    "title": "Classrooms",
    "items": [
     "Curriculum materials",
     "Student supplies",
     "Manipulatives",
     "Teacher resources",
     "Student projects"
    ]
   },
   {
    "title": "Textbook and supply rooms",
    "items": [
     "Textbooks",
     "Paper and supplies",
     "Testing materials",
     "Seasonal items",
     "Overflow furniture"
    ]
   },
   {
    "title": "Science",
    "items": [
     "Lab kits",
     "Glassware",
     "Chemicals",
     "Models and specimens",
     "Safety equipment"
    ]
   },
   {
    "title": "Libraries and media",
    "items": [
     "Books",
     "Periodicals",
     "Media",
     "Laptops and devices",
     "Makerspace supplies"
    ]
   },
   {
    "title": "Arts",
    "items": [
     "Art supplies",
     "Student artwork",
     "Instruments",
     "Sheet music",
     "Costumes and props"
    ]
   },
   {
    "title": "Athletics",
    "items": [
     "Team lockers",
     "Uniforms",
     "Equipment",
     "PE supplies",
     "Field equipment"
    ]
   },
   {
    "title": "Offices and records",
    "items": [
     "Student records",
     "Transcripts",
     "Personnel files",
     "Business office records",
     "Archives"
    ]
   },
   {
    "title": "Facilities",
    "items": [
     "Custodial supplies",
     "Maintenance parts",
     "Grounds equipment",
     "Furniture storage",
     "Event supplies"
    ]
   }
  ],
  "gallery": [
   {
    "src": "assets/guides/education/edu-office-casework-lg.jpg",
    "alt": "Casework with open upper shelving and a work counter"
   },
   {
    "src": "assets/guides/education/edu-library-shelving-lg.jpg",
    "alt": "School library shelving with a book cart"
   }
  ],
  "cta": {
   "heading": "Let’s look at your school together",
   "text": "We’ll walk your classrooms and storage areas, review what each department stores with your team, and lay out options that fit your space, schedule, and budget."
  }
 },
 {
  "slug": "military",
  "sheet": "Military Guide",
  "name": "Military",
  "title": "Military Storage Guide",
  "sr": {
   "word": "read·i·ness",
   "pos": "n.",
   "old": "Gear somewhere in the supply room.",
   "redefined": "Every item assigned, accounted for, and ready to issue."
  },
  "eyebrow": "Military and defense storage",
  "headline": "Built for readiness",
  "tagline": "Improved readiness. Improved accountability. Improved use of space.",
  "introHeading": "Better ways to store, issue, and track gear",
  "intro": [
   "Readiness, accountability, and space: the right storage keeps gear organized, accounted for, and ready to issue. Every project starts with an on-site needs analysis. We review your equipment, your issue and turn-in process, and your security needs, look at your space, and design storage that fits your unit, from a single supply room to a full base facility.",
   "We design, supply, and install, and our own crews complete background checks and any other clearances each job requires. We coordinate installation around operational schedules throughout the Philadelphia region and beyond. Many of the manufacturers we work with hold GSA contracts, so we can offer purchasing through their GSA schedules where it applies, and O’Brien Systems is a Commonwealth of Pennsylvania Small Business (SB) certified vendor."
  ],
  "cardsHeading": "Storage for every part of the installation",
  "hero": {
   "src": "assets/media/mfr/weapons-storage--1.jpg",
   "alt": "Armory with rifles stored on steel shelving"
  },
  "introImg": {
   "src": "assets/media/mfr/military--3.jpg",
   "alt": "Supply room with rows of gear lockers"
  },
  "cards": [
   {
    "title": "Gear lockers",
    "text": "Assigned, labeled lockers for issued equipment, from TA-50 gear to personal items, sized to what each service member is issued.",
    "model": null,
    "img": "assets/media/mfr/military--2.jpg",
    "alt": "Service member at a wall of ventilated gear lockers",
    "photoNote": "gear lockers"
   },
   {
    "title": "Weapons storage and armories",
    "text": "Weapon racks and cabinets with adjustable cradles for rifles, sidearms, optics, and less-lethal equipment, with lock options from key control to electronic access with full audit trails.",
    "model": "weapons",
    "img": "assets/media/mfr/weapons-storage--2.jpg",
    "alt": "Armory room lined with weapons racks",
    "photoNote": "armory"
   },
   {
    "title": "High-density mobile storage",
    "text": "Supply room shelving and gear lockers mounted on carriages that glide along floor rails. The same supply room can hold up to twice the gear, and systems can be locked closed for added security.",
    "model": "install",
    "img": "assets/media/mfr/military--1.jpg",
    "alt": "Storage racks mounted on mobile carriages",
    "photoNote": "supply room on mobile carriages"
   },
   {
    "title": "Supply room shelving",
    "text": "4-post shelving with labeled positions for issue and turn-in, so every item has an assigned place and inventory is easy to count.",
    "model": "four-post",
    "img": "assets/media/mfr/four-post-shelving--3.jpeg",
    "alt": "4-post shelving holding supply boxes",
    "photoNote": "supply room shelving"
   },
   {
    "title": "Wardrobe and uniform cabinets",
    "text": "Wardrobe cabinets with full-height hanging space for uniforms, outerwear, and gear bags, with keyed, padlock hasp, or electronic locks.",
    "model": "wardrobe",
    "img": "assets/media/mfr/military--4.jpg",
    "alt": "Flight suits hanging in steel gear cabinets",
    "photoNote": "wardrobe cabinets"
   },
   {
    "title": "Ready rooms",
    "text": "Gear lockers, benches, and shelving for ready rooms, laid out so service members can gear up quickly.",
    "model": null,
    "img": "assets/guides/military/ps-locker-area.jpg",
    "alt": "Ready room with gear lockers and a bench",
    "photoNote": "ready room"
   },
   {
    "title": "Secure cages",
    "text": "Lockable wire partitions for sensitive items, high-value equipment, and secure storage, with clear sight lines and airflow.",
    "model": "wire-cage",
    "img": "assets/guides/military/gov-wire-cages.jpg",
    "alt": "Row of lockable wire mesh cages",
    "photoNote": "wire partition cage"
   },
   {
    "title": "Vertical lift modules",
    "text": "Enclosed towers that store parts and small items on trays and deliver them on demand, with access controls and transaction tracking for accountability.",
    "model": "vlm",
    "img": "assets/media/mfr/lifts-carousels--1.jpg",
    "alt": "Row of vertical lift modules in a parts room",
    "photoNote": "vlm in a parts room"
   },
   {
    "title": "Maintenance and parts storage",
    "text": "Modular drawer cabinets, bin shelving, and pallet rack for vehicle and equipment maintenance parts, tools, and bench stock.",
    "model": null,
    "img": "assets/guides/military/edu-maintenance-shelving.jpg",
    "alt": "Maintenance shop shelving over drawer cabinets",
    "photoNote": "maintenance parts room"
   },
   {
    "title": "Records storage",
    "text": "High-density mobile storage, rotary cabinets, and fire-rated cabinets for personnel files, training records, and administrative records.",
    "model": null,
    "img": "assets/guides/military/hc-records-mobile-files.jpg",
    "alt": "Mobile file shelving holding records",
    "photoNote": "records room"
   },
   {
    "title": "Smart lockers",
    "text": "Smart lockers for shared equipment, radios, and package delivery, with compartments assigned, unlocked, and tracked electronically.",
    "model": "smart-lockers",
    "img": "assets/media/2025/10/NEW-OCS-Smart-Brochure.jpeg",
    "alt": "Hand entering a code on a smart locker keypad",
    "photoNote": "smart lockers"
   },
   {
    "title": "Mailrooms",
    "text": "Sort modules and mailroom casework for unit and base mail, sized to your daily volume.",
    "model": null,
    "img": "assets/media/mfr/mail-sorters--3.jpg",
    "alt": "Mailroom with sort modules and a center work island",
    "photoNote": "mailroom"
   }
  ],
  "v3d": {
   "eyebrow": "Explore in 3D",
   "heading": "Open the lockers, move the carriages, see how it works",
   "sub": "Drag to turn a model, tap parts to open them, and pick another system from the list.",
   "tabs": [
    "Weapons Storage Cabinet",
    "High-Density Mobile Storage Install, Step by Step",
    "4-Post Steel Shelving",
    "Steel Wardrobe Cabinets",
    "Wire Partition Enclosure",
    "Vertical Lift Module (VLM)"
   ],
   "models": [
    "weapons",
    "install",
    "four-post",
    "wardrobe",
    "wire-cage",
    "vlm"
   ]
  },
  "appsHeading": "Applications for every installation",
  "appsIntro": "Military units, bases, armories, training centers, and defense facilities.",
  "apps": [
   {
    "title": "Armory",
    "items": [
     "Rifles",
     "Sidearms",
     "Optics",
     "Night vision",
     "Less-lethal equipment"
    ]
   },
   {
    "title": "Issued gear",
    "items": [
     "TA-50 gear",
     "Body armor",
     "Helmets",
     "Rucksacks",
     "Cold weather gear"
    ]
   },
   {
    "title": "Supply room",
    "items": [
     "Issue and turn-in",
     "Expendables",
     "Uniforms",
     "Bulk supplies",
     "Unit property"
    ]
   },
   {
    "title": "Ready rooms",
    "items": [
     "Personal gear",
     "Go-bags",
     "Radios",
     "Duty gear",
     "Outerwear"
    ]
   },
   {
    "title": "Maintenance",
    "items": [
     "Vehicle parts",
     "Tools",
     "Bench stock",
     "Lubricants",
     "Technical manuals"
    ]
   },
   {
    "title": "Secure storage",
    "items": [
     "Sensitive items",
     "Communications equipment",
     "High-value equipment",
     "Keys",
     "Electronics"
    ]
   },
   {
    "title": "Admin and records",
    "items": [
     "Personnel files",
     "Training records",
     "Hand receipts",
     "Publications",
     "Archives"
    ]
   },
   {
    "title": "Base operations",
    "items": [
     "Mail and packages",
     "Facilities supplies",
     "Grounds equipment",
     "Dining facility supplies",
     "Fitness equipment"
    ]
   }
  ],
  "gallery": [
   {
    "src": "assets/media/mfr/weapons-storage--3.jpg",
    "alt": "Rifles on high-density mobile weapons storage"
   },
   {
    "src": "assets/media/2026/06/IMG_9309.jpeg",
    "alt": "Supply room with rows of steel shelving"
   }
  ],
  "cta": {
   "heading": "Let’s look at your space together",
   "text": "We’ll walk your armory, supply rooms, and storage areas, review your equipment with your team, and lay out options that fit your space, mission, and budget."
  }
 }
];

/* ---------------- helpers ---------------- */
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PHONE = '610.825.3405', TEL = '6108253405', EMAIL = 'sales@obriensys.com';

// "Storage Redefined" entry: bold word with syllable dots, italic part of speech, struck-through old line, teal "Redefined:" label
function srEntry({ word, pos, old, redefined, onDark }) {
  return `<div class="sr${onDark ? ' dark' : ''}">
      <div class="sr-h"><b class="sr-w">${esc(word)}</b> <i class="sr-pos">(${esc(pos)})</i></div>
      ${old ? `<div class="sr-old">${esc(old)}</div>` : ''}
      <div class="sr-new"><span class="sr-lab">Redefined:</span> ${esc(redefined)}</div>
    </div>`;
}

// relative links are written from the site root (assets/..., contact.html); pages two folders down need ../../
const isRel = (u) => !!u && !/^(?:[a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(u);
function relink(html, prefix) {
  if (!prefix) return html;
  return html
    .replace(/(\s(?:href|src|data-bg|data-src|poster)=")([^"]*)"/g, (m, a, u) => (isRel(u) ? `${a}${prefix}${u}"` : m))
    .replace(/(\s(?:href|src|data-bg|data-src|poster)=')([^']*)'/g, (m, a, u) => (isRel(u) ? `${a}${prefix}${u}'` : m))
    .replace(/url\((['"]?)([^'")]+)\1\)/g, (m, q, u) => (isRel(u) ? `url(${q}${prefix}${u}${q})` : m));
}

// the build's copy guard, applied here too because these pages are written outside its loop
function guard(file, html) {
  const bad = [/—/, /&mdash;/, /nationwide/i].find((re) => re.test(html.replace(/<script[\s\S]*?<\/script>/g, '')));
  if (bad) throw new Error(`${file}: copy rule violation (${bad})`);
}

// a guide ends with its own call to action, so the shell's site-wide one (<div class="cta" id="contact">) is taken out
// of guide pages; pass ctx.keepSiteCta to keep it. Removes exactly that balanced <div>, nothing else.
function dropSiteCta(html) {
  const start = html.indexOf('<div class="cta" id="contact">');
  if (start < 0) return html;
  const re = /<\/?div\b[^>]*>/g; re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[0][1] === '/' ? -1 : 1;
    if (depth === 0) return html.slice(0, start) + html.slice(re.lastIndex);
  }
  return html;
}

function finish(file, html, prefix, ctx, desc, ownCta) {
  const X = ctx && ctx.X;
  if (ownCta && !ctx.keepSiteCta) html = dropSiteCta(html);
  if (X && X.enrich) html = X.enrich(file, html);
  if (desc) {
    const d = desc.length > 158 ? desc.slice(0, 155).replace(/\s+\S*$/, '') + '...' : desc;
    const a = esc(d).replace(/'/g, '&#39;');
    html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${a}$2`).replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${a}$2`);
  }
  if (X && X.lazyMedia) html = X.lazyMedia(html);
  html = relink(html, prefix);
  guard(file, html);
  return html;
}

/* ---------------- guide page ---------------- */
function card(c, tabs) {
  let btn = '';
  if (c.model && tabs.includes(c.model)) btn = `<button type="button" class="gd-3dlink" data-model="${esc(c.model)}">See it in 3D</button>`;
  else if (c.model) btn = `<a class="gd-3dlink" href="showroom.html?model=${esc(c.model)}">See it in 3D</a>`;
  return `
        <article class="gd-card">
          <img src="${esc(c.img)}" alt="${esc(c.alt)}" loading="lazy" decoding="async">
          <div class="gd-card-b">
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.text)}</p>${btn ? `\n            ${btn}` : ''}
          </div>
        </article>`;
}

function guideBody(g, ver) {
  const models = g.v3d.models;
  return `
<div class="gd">
  <section class="gd-hero">
    <img class="gd-hero-img" src="${esc(g.hero.src)}" alt="${esc(g.hero.alt)}" loading="eager" fetchpriority="high" decoding="async">
    <div class="wrap crumbs"><a href="index.html">Home</a> / <a href="guides/index.html">Industry Guides</a> / ${esc(g.name)}</div>
    <div class="wrap gd-hero-in">
      ${srEntry({ ...g.sr, onDark: true })}
      <span class="eyebrow">${esc(g.eyebrow)}</span>
      <h1>${esc(g.headline)}</h1>
      <p class="gd-tag">${esc(g.tagline)}</p>
    </div>
  </section>

  <section class="wrap gd-intro">
    <div>
      <h2>${esc(g.introHeading)}</h2>
      ${g.intro.map((p) => `<p>${esc(p)}</p>`).join('\n      ')}
    </div>
    <img src="${esc(g.introImg.src)}" alt="${esc(g.introImg.alt)}" loading="lazy" decoding="async">
  </section>

  <section class="gd-band">
    <div class="wrap">
      <h2>${esc(g.cardsHeading)}</h2>
      <div class="gd-grid">${g.cards.map((c) => card(c, models)).join('')}
      </div>
    </div>
  </section>

  <section class="wrap gd-3d" id="explore-3d">
    <span class="eyebrow">${esc(g.v3d.eyebrow)}</span>
    <h2>${esc(g.v3d.heading)}</h2>
    <p>${esc(g.v3d.sub)}</p>
    <div class="v3d" data-models="${esc(models.join(','))}" data-lite="1" data-src="assets/3d/viewer.js${ver ? `?v=${esc(ver)}` : ''}"></div>
  </section>

  <section class="gd-band">
    <div class="wrap">
      <h2>${esc(g.appsHeading)}</h2>
      <p class="gd-spec">${esc(g.appsIntro)}</p>
      <div class="gd-apps">${g.apps.map((a) => `
        <div class="gd-app">
          <h3>${esc(a.title)}</h3>
          <ul>${a.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="wrap gd-gallery">
    ${g.gallery.map((p) => `<img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" decoding="async">`).join('\n    ')}
  </section>

  <section class="gd-cta">
    <div class="wrap">
      <h2>${esc(g.cta.heading)}</h2>
      <p>${esc(g.cta.text)}</p>
      <div class="gd-actions">
        <a class="gd-btn" href="contact.html">Schedule a free on-site assessment</a>
        <a class="gd-btn gd-btn-o" href="tel:${TEL}">Call ${PHONE}</a>
        <a class="gd-btn gd-btn-o" href="mailto:${EMAIL}">${EMAIL}</a>
      </div>
    </div>
  </section>
</div>
<script>
// the 3D engine (about 1 MB) loads only when the viewer comes near the screen;
// "See it in 3D" on a card jumps to the viewer and opens that model
(function () {
  var el = document.querySelector('.gd .v3d'); if (!el) return;
  var go = false;
  function load() { if (go) return; go = true; var s = document.createElement('script'); s.type = 'module'; s.src = el.getAttribute('data-src'); document.body.appendChild(s); }
  if (!('IntersectionObserver' in window)) load();
  else { var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '600px' }); io.observe(el); }
  document.querySelectorAll('.gd-3dlink[data-model]').forEach(function (b) {
    b.addEventListener('click', function () {
      load(); el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var id = b.getAttribute('data-model'), tries = 0;
      (function pick() { var t = el.querySelector('[data-id="' + id + '"]'); if (t) t.click(); else if (tries++ < 100) setTimeout(pick, 150); })();
    });
  });
})();
</script>`;
}

const pathOf = (g) => `guides/${g.slug}/index.html`;

function guidePages(shell, ctx = {}) {
  return GUIDES.map((g) => {
    const file = pathOf(g);
    const html = shell(`${g.title} | O'Brien Systems`, '/' + g.hero.src, guideBody(g, ctx.VER));
    return { path: file, html: finish(file, html, '../../', ctx, g.intro[0], true) };
  });
}

/* ---------------- hub ---------------- */
function guidesIndex(shell, ctx = {}) {
  const file = 'guides/index.html';
  const cards = GUIDES.map((g) => `
    <a class="card" href="${pathOf(g)}"><div class="ph" style="background-image:url('${esc(g.hero.src)}')"></div>
      <div class="bd"><span class="meta">${esc(g.eyebrow)}</span><h3>${esc(g.name)}</h3><p>${esc(g.sr.redefined)}</p><span class="go">Open the guide &rarr;</span></div></a>`).join('');
  const html = shell(`Industry Guides | O'Brien Systems`, '/' + GUIDES[0].hero.src, `
<div class="page-hero">
  <div class="wrap crumbs"><a href="index.html">Home</a> / Industry Guides</div>
  <div class="wrap">
    <span class="eyebrow">Industry guides</span>
    <h1>Industry Guides</h1>
  </div>
</div>
<section class="block gd-hub"><div class="wrap">
  <div class="cards">${cards}
  </div>
</div></section>`);
  return { path: file, html: finish(file, html, '../', ctx) };
}

const allPages = (shell, ctx) => [...guidePages(shell, ctx), guidesIndex(shell, ctx)];

/* ---------------- CSS (appended to assets/style.css) ---------------- */
const guideCss = `
/* Storage Redefined dictionary entry (reusable: .sr on light backgrounds, .sr.dark on dark heroes) */
.sr{max-width:600px;margin:0 0 24px;font-size:1rem;line-height:1.5;color:var(--ink)}
.sr-h{margin-bottom:4px}
.sr-w{font-size:1.4rem;font-weight:800;letter-spacing:.01em}
.sr-pos{font-style:italic;font-size:.92rem;color:var(--muted);margin-left:2px}
.sr-old{color:#8a9799;text-decoration:line-through;text-decoration-thickness:1px}
.sr-new{color:var(--ink)}
.sr-lab{color:var(--teal);font-weight:700}
.sr.dark,.sr.dark .sr-new{color:#fff}
.sr.dark .sr-pos{color:#d3e3e3}
.sr.dark .sr-old{color:#b7c4c5;text-decoration-color:#b7c4c5}
.sr.dark .sr-lab{color:var(--teal-soft)}

/* industry guide pages */
.gd h1,.gd h2,.gd-card h3,.gd-app h3{text-transform:uppercase;letter-spacing:.01em}
.gd h2{font-size:clamp(1.55rem,3vw,2.2rem);line-height:1.15;color:var(--ink);max-width:none}
.gd-hero{position:relative;min-height:500px;display:flex;flex-direction:column;justify-content:flex-end;color:#fff;background:var(--teal-ink);overflow:hidden}
.gd-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.gd-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,rgba(2,41,43,.92) 0%,rgba(2,60,63,.76) 55%,rgba(2,60,63,.45) 100%)}
.gd-hero .crumbs{position:absolute;top:0;left:0;right:0;z-index:2}
.gd-hero-in{position:relative;z-index:2;width:100%;padding-top:96px;padding-bottom:60px}
.gd-hero .eyebrow{color:var(--teal-soft)}
.gd-hero h1{font-size:clamp(2rem,5vw,3.4rem);line-height:1.05;max-width:20ch;margin:.1rem 0 .9rem;color:#fff}
.gd-tag{font-size:clamp(1rem,2vw,1.2rem);color:#e2f0f0;max-width:60ch}
.gd-intro{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:48px;align-items:center;padding-top:72px;padding-bottom:72px}
.gd-intro p{font-size:1.04rem;line-height:1.7;color:#39494c;margin-top:14px}
.gd-intro img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius);box-shadow:var(--shadow)}
.gd-band{background:var(--mist);padding:72px 0}
.gd-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px;margin-top:30px}
.gd-card{background:#fff;border-radius:var(--radius);overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.06),0 6px 18px rgba(2,60,63,.07);display:flex;flex-direction:column}
.gd-card img{width:100%;aspect-ratio:4/3;object-fit:cover;background:#e9efef}
.gd-card-b{padding:18px 18px 22px;display:flex;flex-direction:column;flex:1}
.gd-card h3{font-size:1rem;line-height:1.25;color:var(--teal-ink);margin-bottom:8px}
.gd-card p{font-size:.9rem;line-height:1.55;color:#3b4a4d}
.gd-3dlink{align-self:flex-start;margin-top:14px;padding:8px 14px;border:0;border-radius:999px;background:#e3f1f1;color:var(--teal-dark);font:inherit;font-weight:700;font-size:.8rem;line-height:1;cursor:pointer;transition:background .15s,color .15s}
.gd-3dlink:hover{background:var(--teal);color:#fff}
.gd-3d{padding-top:72px;padding-bottom:72px}
.gd-3d>p{color:var(--muted);max-width:720px;margin-top:10px}
.gd-3d .v3d{margin-top:24px}
.gd-spec{color:#3b4a4d;max-width:820px;margin-top:12px;font-size:1.02rem}
.gd-apps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin-top:26px}
.gd-app{background:#fff;border-radius:12px;padding:18px 20px;border-top:3px solid var(--teal)}
.gd-app h3{font-size:.95rem;line-height:1.3;color:var(--teal-ink);margin-bottom:8px}
.gd-app ul{padding-left:18px;font-size:.9rem;line-height:1.75;color:#3b4a4d}
.gd-gallery{display:grid;grid-template-columns:1fr 1fr;gap:22px;padding-top:72px;padding-bottom:72px}
.gd-gallery img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:var(--radius);background:#e9efef}
.gd-cta{background:var(--teal-ink);color:#fff;padding:72px 0;text-align:center}
.gd-cta h2{color:#fff;margin:0 auto}
.gd-cta p{max-width:640px;margin:14px auto 26px;color:#cfe9ea;font-size:1.05rem}
.gd-actions{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.gd-btn{display:inline-block;padding:13px 22px;border-radius:999px;background:#fff;color:var(--teal-ink);font-weight:700;transition:transform .15s ease,background .15s ease}
.gd-btn:hover{transform:translateY(-1px)}
.gd-btn-o{background:transparent;color:#fff;box-shadow:inset 0 0 0 2px rgba(255,255,255,.7)}
.gd-btn-o:hover{background:rgba(255,255,255,.12)}
.gd-hub .card .ph{height:200px}
@media (max-width:1100px){.gd-grid,.gd-apps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:800px){.gd-intro,.gd-gallery{grid-template-columns:1fr;gap:24px;padding-top:52px;padding-bottom:52px}.gd-band,.gd-cta{padding:52px 0}.gd-3d{padding-top:52px;padding-bottom:52px}.gd-hero{min-height:440px}}
@media (max-width:560px){.gd-grid,.gd-apps{grid-template-columns:1fr}.gd-hero-in{padding-top:72px;padding-bottom:40px}.sr-w{font-size:1.2rem}.gd-btn{width:100%;text-align:center}}
`;

module.exports = { GUIDES, guideCss, srEntry, guidePages, guidesIndex, allPages, relink };
