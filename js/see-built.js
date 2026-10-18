/* ---------------------------------------------------------------------
   see-built.js — the "Built" board view.

   Renders the current brand (abView(): aesthetic, blend, classic version,
   pure ground, fonts, colours, logo) as realistic, clickable product screens:
   the UI kit (every UI_KIT component and state, js/ui-kit.js), a SaaS
   dashboard, a mobile app (welcome + home), a landing page and a settings
   page. Every screen is built from the kit and none draws board art: the
   landing hero shows the product itself (the Home phone). Phones are
   laid out at UI_KIT_PHONE's 390 x 844 and scaled down as a whole device. Every branded screen sits in the board's own
   `.ab[data-ae]` root (abBoardParts(...).rootOpen) and uses the board's
   component classes (.ab-card, .ab-panel, .ab-seg, .ab-cta, .ab-input,
   .ab-toggle/.ab-switch, .ab-list/.ab-row, .ab-headline ...), so
   each aesthetic's own CSS styles it. Layout lives in css/see-built.css.

   Before / after: the same screen drawn as a generic AI-built app (system
   font, indigo button, white cards) under a draggable divider.

   Entry points: Show.built(kind), Show.beforeAfter(on), SeeBuilt.render().
   Deterministic templates only. Plain <script>, no modules.
------------------------------------------------------------------------ */

(function () {
  const KINDS = [
    ['kit', 'UI kit'],
    ['dashboard', 'Dashboard'],
    ['mobile', 'Mobile app'],
    ['landing', 'Landing page'],
    ['settings', 'Settings'],
  ];
  const SB = { kind: 'dashboard', before: false, split: 50 };
  let seq = 0;

  /* ---------------- copy: one vocabulary per kind of business ---------------- */

  // The brand name and tagline pick the vocabulary, so a bakery gets orders and
  // delivery boxes and a software brand gets deploys and seats. First match wins.
  const DOMAINS = [
    {
      key: 'food',
      re: /\b(food|foods|kitchen|bak(e|er|ery|ing)|bread|coffee|caf[eé]|provision|provisions|farm|farms|grocer|grocery|market|meal|meals|recipe|restaurant|pantry|harvest|organic|tea|wine|brew|brewing|eat|eats|fresh|deli|orchard|garden|table|larder|sourced|spice|olive|cheese)\b/i,
      nav: ['Overview', 'Orders', 'Customers', 'Products', 'Suppliers'],
      search: 'Search orders',
      action: ['New order', 'Order started'],
      stats: [['Revenue', '$48,290', '+12.4%', 1], ['Orders', '1,284', '+8.1%', 1], ['Repeat customers', '62%', '+3.0%', 1], ['Average basket', '$37.60', '−1.2%', 0]],
      chart: ['Revenue', '$', 1700],
      listTitle: 'Orders in progress',
      rows: [['Harbor Café', 'Packing', 72], ['Elm & Rye Bakery', 'Picking', 45], ['The Larder Co-op', 'Out for delivery', 90], ['Marigold Kitchen', 'Confirmed', 15]],
      panel: { title: 'Delivery', field: ['Order cut-off', '4:00 pm'], toggles: [['Auto-confirm orders', true], ['Text customers on dispatch', false]] },
      mobile: {
        welcome: 'From small farms to your door',
        body: 'Choose a weekly box, skip a week any time, and see where every item was grown.',
        hello: 'Your next box', card: ['Arrives Thursday', 'Seasonal vegetable box · 9 items'],
        cta: ['Edit this box', 'Box updated'], seg: ['This week', 'Next week'],
        listTitle: 'In your box',
        rows: [['Ripe tomatoes', 'Picked', 100], ['Sourdough loaf', 'Baking', 60], ['Free-range eggs', 'Packed', 100]],
        tabs: ['Home', 'Boxes', 'Saved', 'Account'],
      },
      landing: {
        kicker: 'Weekly boxes from small farms',
        pitch: name => `${name} brings seasonal food from growers within a day's drive, packed the morning it ships.`,
        cta: ['Choose a box', 'Box chosen'], second: 'See this week',
        features: [
          ['Picked this week', 'Everything in the box was harvested within three days of delivery.'],
          ['Skip or pause anytime', 'Change, skip or pause from your phone up to Monday night.'],
          ['Know your grower', 'Every item lists the farm, the town and the day it was picked.'],
        ],
        plans: [['Small box', 24, 'For one or two', ['6 to 8 items', 'Free delivery', 'Skip any week']],
          ['Family box', 39, 'Feeds four', ['10 to 12 items', 'Free delivery', 'Recipe cards']],
          ['Pantry plus', 58, 'Box and staples', ['Family box', 'Bread, eggs and dairy', 'Priority slots']]],
        per: 'week',
      },
      notify: [['New orders', 'A message for every order placed', true], ['Low stock', 'When a product drops under 10 left', true], ['Weekly summary', 'Sales and top products every Monday', false]],
      planNote: 'orders this month',
    },
    {
      key: 'software',
      re: /\b(cloud|data|code|coder|dev|deploy|stack|api|sync|app|apps|labs?|software|ai|ml|bit|byte|bytes|logic|signal|pixel|server|ops|tech|digital|platform|systems?|network|grid|node|flow|works|metric|metrics|analytics|build|ship)\b/i,
      nav: ['Overview', 'Projects', 'Deploys', 'Team', 'Usage'],
      search: 'Search projects',
      action: ['New project', 'Project created'],
      stats: [['Active users', '18,420', '+9.2%', 1], ['Deploys this week', '312', '+21%', 1], ['Uptime', '99.98%', '+0.02%', 1], ['Median response', '184 ms', '−6.5%', 1]],
      chart: ['Requests', '', 42000],
      listTitle: 'Projects shipping this week',
      rows: [['New checkout', 'In review', 72], ['Mobile sync', 'Building', 45], ['Billing API v2', 'Testing', 88], ['Welcome emails', 'Planned', 10]],
      panel: { title: 'Release', field: ['Release name', 'Spring 2.4'], toggles: [['Deploy on merge', true], ['Require a reviewer', true]] },
      mobile: {
        welcome: 'Your whole team, one place',
        body: 'Track every project, review changes and ship from wherever you are.',
        hello: 'Good morning', card: ['3 reviews waiting', 'Checkout redesign needs a second look.'],
        cta: ['Start review', 'Review started'], seg: ['Assigned', 'Following'],
        listTitle: 'Today',
        rows: [['New checkout', 'Review', 72], ['Billing API v2', 'Testing', 88], ['Mobile sync', 'Building', 45]],
        tabs: ['Home', 'Projects', 'Inbox', 'Profile'],
      },
      landing: {
        kicker: 'For teams that ship every day',
        pitch: name => `${name} keeps projects, reviews and releases in one quiet place, so your team spends the day building.`,
        cta: ['Start free', 'Workspace ready'], second: 'Book a demo',
        features: [
          ['Everything in one view', 'Projects, reviews and releases share one timeline.'],
          ['Ship with confidence', 'Every change is checked, reviewed and reversible.'],
          ['Fast by default', 'Pages load in under 200 ms, wherever your team works.'],
        ],
        plans: [['Starter', 0, 'For side projects', ['3 projects', '1 GB storage', 'Community help']],
          ['Team', 24, 'Per seat', ['Unlimited projects', 'Reviews and releases', 'Priority help']],
          ['Business', 49, 'Per seat', ['Everything in Team', 'Single sign-on', 'Audit log']]],
        per: 'month',
      },
      notify: [['Review requests', 'When someone asks for your review', true], ['Failed deploys', 'Right away, by email and push', true], ['Weekly digest', 'What shipped, every Friday', false]],
      planNote: 'seats in use',
    },
    {
      key: 'finance',
      re: /\b(pay|pays|payment|bank|banking|capital|fund|funds|invest|money|ledger|wealth|finance|financial|coin|cash|credit|tax|accounting|books|budget|savings?|equity|trust|vault)\b/i,
      nav: ['Overview', 'Accounts', 'Payments', 'Invoices', 'Reports'],
      search: 'Search payments',
      action: ['New invoice', 'Invoice drafted'],
      stats: [['Balance', '$284,120', '+4.8%', 1], ['Incoming', '$62,400', '+11.2%', 1], ['Outgoing', '$38,950', '+2.1%', 0], ['Overdue', '3 invoices', '−2', 1]],
      chart: ['Cash flow', '$', 9000],
      listTitle: 'Invoices due',
      rows: [['Northline Studio', 'Sent', 40], ['Parcel & Post', 'Partly paid', 65], ['Fernwood Dental', 'Paid', 100], ['Atlas Hardware', 'Overdue', 20]],
      panel: { title: 'Payments', field: ['Payment terms', 'Net 30'], toggles: [['Send reminders', true], ['Accept card payments', true]] },
      mobile: {
        welcome: 'Money, clearly',
        body: 'See every account, every payment and what is coming next, in one calm view.',
        hello: 'Total balance', card: ['$284,120', 'Up $13,040 since last month'],
        cta: ['Send money', 'Payment ready'], seg: ['Accounts', 'Cards'],
        listTitle: 'Recent',
        rows: [['Fernwood Dental', 'Received', 100], ['Office rent', 'Scheduled', 30], ['Parcel & Post', 'Pending', 65]],
        tabs: ['Home', 'Payments', 'Cards', 'Profile'],
      },
      landing: {
        kicker: 'Banking for small teams',
        pitch: name => `${name} puts accounts, invoices and payments side by side, so you always know where the money is.`,
        cta: ['Open an account', 'Account opened'], second: 'See pricing',
        features: [
          ['Get paid faster', 'Invoices with a pay button, and reminders that send themselves.'],
          ['Every account, one view', 'Balances refresh every few minutes, across every bank.'],
          ['Ready for tax time', 'Receipts and categories are matched as you go.'],
        ],
        plans: [['Essential', 0, 'For freelancers', ['1 account', '10 invoices a month', 'Card payments']],
          ['Growth', 29, 'For small teams', ['Unlimited invoices', 'Automatic reminders', '5 team members']],
          ['Scale', 79, 'For finance teams', ['Everything in Growth', 'Approvals', 'Accountant access']]],
        per: 'month',
      },
      notify: [['Payments received', 'Each time an invoice is paid', true], ['Large payments', 'Anything over $5,000 leaving an account', true], ['Monthly statement', 'On the first of every month', false]],
      planNote: 'invoices this month',
    },
    {
      key: 'wellness',
      re: /\b(health|care|clinic|wellness|well|fit|fitness|yoga|therapy|med|medical|mind|mindful|sleep|calm|body|breath|breathe|move|movement|pilates|run|running|nutrition|dental|spa|heal|healing)\b/i,
      nav: ['Overview', 'Schedule', 'Clients', 'Programs', 'Messages'],
      search: 'Search clients',
      action: ['Book session', 'Session booked'],
      stats: [['Sessions this week', '146', '+14%', 1], ['Active clients', '892', '+6.3%', 1], ['Attendance', '94%', '+2.0%', 1], ['Waitlist', '23', '−4', 1]],
      chart: ['Bookings', '', 60],
      listTitle: 'Programs running',
      rows: [['Strength', 'Full', 100], ['Mobility basics', 'Open', 60], ['Sleep reset', 'Starting soon', 25], ['Breathwork', 'Open', 45]],
      panel: { title: 'Bookings', field: ['Cancel by', '12 hrs before'], toggles: [['Allow waitlist', true], ['Send day-before reminders', true]] },
      mobile: {
        welcome: 'A little better, every day',
        body: 'Short sessions, gentle reminders and progress you can actually see.',
        hello: 'Today', card: ['Morning strength', '7:30 am · 35 minutes · Studio 2'],
        cta: ['Check in', 'Checked in'], seg: ['Today', 'This week'],
        listTitle: 'Your week',
        rows: [['Mobility basics', 'Booked', 100], ['Breathwork', 'Waitlist', 40], ['Sleep reset', 'Starts Monday', 0]],
        tabs: ['Today', 'Classes', 'Progress', 'Profile'],
      },
      landing: {
        kicker: 'Classes, coaching and care',
        pitch: name => `${name} helps you build habits that stay, with small classes and coaches who know your name.`,
        cta: ['Book a first class', 'Class booked'], second: 'See the timetable',
        features: [
          ['Small classes', 'Never more than twelve people, so you get real attention.'],
          ['Book in seconds', 'See open spots, join a waitlist and check in from your phone.'],
          ['Progress you can see', 'Every session adds to a simple record of how far you have come.'],
        ],
        plans: [['Drop in', 18, 'One class', ['Any class', 'Mat and towel', 'No commitment']],
          ['Monthly', 89, 'Unlimited classes', ['All classes', 'Two guest passes', 'Progress tracking']],
          ['Coached', 149, 'With a coach', ['Unlimited classes', 'Monthly check-in', 'Personal plan']]],
        per: 'month',
      },
      notify: [['New bookings', 'Each time a client books', true], ['Cancellations', 'When a spot opens up', true], ['Weekly report', 'Attendance every Sunday evening', false]],
      planNote: 'active clients',
    },
    {
      key: 'studio',
      re: /\b(studio|studios|design|designs|creative|agency|art|arts|photo|photography|film|films|media|press|print|type|ink|brand|branding|story|stories|craft|made|make|maker|makers|atelier|gallery|journal|editions?|publishing|letters?)\b/i,
      nav: ['Overview', 'Projects', 'Clients', 'Proposals', 'Invoices'],
      search: 'Search projects',
      action: ['New project', 'Project created'],
      stats: [['Booked this quarter', '$126,000', '+18%', 1], ['Active projects', '14', '+3', 1], ['Proposals out', '6', '+2', 1], ['Hours this week', '212', '−4%', 0]],
      chart: ['Billed hours', '', 48],
      listTitle: 'Projects in progress',
      rows: [['Brand refresh · Fernwood', 'In review', 72], ['Launch site · Atlas', 'Building', 45], ['Spring campaign · Marlow', 'Planned', 10], ['Annual report · Kestrel', 'Final proofs', 92]],
      panel: { title: 'Studio', field: ['Default day rate', '$1,200'], toggles: [['Share drafts with clients', true], ['Track time automatically', false]] },
      mobile: {
        welcome: 'Every project, in your pocket',
        body: 'Check in on work, answer client notes and approve proofs between meetings.',
        hello: 'This week', card: ['Brand refresh', 'Fernwood · round two due Friday'],
        cta: ['Open project', 'Project opened'], seg: ['Active', 'Done'],
        listTitle: 'Needs you',
        rows: [['Launch site · Atlas', 'Feedback', 45], ['Annual report', 'Proofs', 92], ['Spring campaign', 'Brief', 10]],
        tabs: ['Home', 'Projects', 'Inbox', 'Profile'],
      },
      landing: {
        kicker: 'Independent design studio',
        pitch: name => `${name} makes identities, websites and campaigns for people who care how things are made.`,
        cta: ['Start a project', 'Message sent'], second: 'See our work',
        features: [
          ['Identity', 'Names, marks and type systems that hold up for years.'],
          ['Digital', 'Websites and products that feel as good as they look.'],
          ['Campaigns', 'Launches, print and film, made with a small senior team.'],
        ],
        plans: [['Sprint', 4500, 'Two weeks', ['One focused deliverable', 'Two review rounds', 'Source files']],
          ['Project', 18000, 'Six to eight weeks', ['Identity or website', 'Weekly reviews', 'Launch support']],
          ['Partner', 9000, 'Monthly retainer', ['Ongoing design team', 'Priority scheduling', 'Quarterly planning']]],
        per: 'from',
      },
      notify: [['Client comments', 'When a client leaves a note on a draft', true], ['Proposal opened', 'When a client reads your proposal', true], ['Weekly hours', 'A summary every Friday', false]],
      planNote: 'projects this quarter',
    },
    {
      key: 'retail',
      re: /\b(wear|apparel|shop|store|goods|supply|supplies|fashion|boutique|cloth|clothing|outfitters?|home|homeware|living|objects?|thread|threads|denim|shoes|bags|jewel|jewelry|vintage|trade|trading|co|company|outpost)\b/i,
      nav: ['Overview', 'Orders', 'Products', 'Customers', 'Discounts'],
      search: 'Search products',
      action: ['Add product', 'Product added'],
      stats: [['Sales', '$73,940', '+15.2%', 1], ['Orders', '2,316', '+9.4%', 1], ['Conversion', '3.4%', '+0.3%', 1], ['Returns', '2.1%', '−0.4%', 1]],
      chart: ['Sales', '$', 2600],
      listTitle: 'Restock in progress',
      rows: [['Field jacket', 'In transit', 72], ['Linen overshirt', 'Ordered', 35], ['Canvas tote', 'Received', 100], ['Wool beanie', 'Planned', 10]],
      panel: { title: 'Store', field: ['Free shipping', 'Over $75'], toggles: [['Show low stock badges', true], ['Allow pre-orders', false]] },
      mobile: {
        welcome: 'Made to last',
        body: 'New arrivals every Thursday, free returns, and a wishlist that tells you when your size is back.',
        hello: 'New this week', card: ['Waxed field jacket', 'Back in stock in olive and navy'],
        cta: ['Add to bag', 'Added to bag'], seg: ['New', 'Popular'],
        listTitle: 'Your orders',
        rows: [['Linen overshirt', 'Shipped', 70], ['Canvas tote', 'Delivered', 100], ['Wool beanie', 'Preparing', 20]],
        tabs: ['Shop', 'Search', 'Bag', 'Account'],
      },
      landing: {
        kicker: 'Everyday goods, built to last',
        pitch: name => `${name} makes a small range of things you will use every day, and repairs them when they wear.`,
        cta: ['Shop new arrivals', 'Opening the shop'], second: 'Our materials',
        features: [
          ['Fewer, better things', 'A short range, made in small runs from materials that age well.'],
          ['Free repairs for life', 'Send it back and we will mend it, for as long as you own it.'],
          ['Honest prices', 'We show what each piece costs to make, and what we keep.'],
        ],
        plans: [['Member', 0, 'Free to join', ['Early access', 'Free returns', 'Birthday gift']],
          ['Insider', 8, 'Monthly', ['Free shipping', 'Members-only colours', 'Repair priority']],
          ['Founder', 80, 'Yearly', ['Everything in Insider', 'Studio visits', 'First pick of runs']]],
        per: 'month',
      },
      notify: [['New orders', 'Each time an order is placed', true], ['Back in stock', 'When a sold-out product returns', true], ['Weekly sales', 'Every Monday morning', false]],
      planNote: 'orders this month',
    },
  ];
  const DEFAULT_DOMAIN = {
    key: 'workspace',
    nav: ['Overview', 'Projects', 'Calendar', 'People', 'Reports'],
    search: 'Search everything',
    action: ['New project', 'Project created'],
    stats: [['Active projects', '24', '+4', 1], ['Tasks done', '1,148', '+12%', 1], ['On schedule', '87%', '+5%', 1], ['Hours logged', '642', '−3%', 0]],
    chart: ['Tasks completed', '', 160],
    listTitle: 'Projects in progress',
    rows: [['Brand refresh', 'In review', 72], ['Launch site', 'Building', 45], ['Spring campaign', 'Planned', 10], ['Customer interviews', 'Writing up', 88]],
    panel: { title: 'Workspace', field: ['Week starts on', 'Monday'], toggles: [['Daily summary', true], ['Show weekends', false]] },
    mobile: {
      welcome: 'Plans that keep up with you',
      body: 'Projects, tasks and the people doing them, organised in one calm place.',
      hello: 'Today', card: ['Launch site', 'Two tasks due before Friday'],
      cta: ['Open project', 'Project opened'], seg: ['Mine', 'Team'],
      listTitle: 'Up next',
      rows: [['Brand refresh', 'Review', 72], ['User interviews', 'Writing', 88], ['Spring campaign', 'Planning', 10]],
      tabs: ['Home', 'Projects', 'Inbox', 'Profile'],
    },
    landing: {
      kicker: 'Planning for small teams',
      pitch: name => `${name} keeps plans, people and progress in one place, so the work gets the attention, not the tools.`,
      cta: ['Get started', 'Welcome aboard'], second: 'Take the tour',
      features: [
        ['One clear plan', 'Every project, task and deadline on a single timeline.'],
        ['Built for small teams', 'Set up in minutes, with nothing to configure.'],
        ['Calm by design', 'One summary a day instead of a hundred notifications.'],
      ],
      plans: [['Free', 0, 'For individuals', ['3 projects', 'Unlimited tasks', 'Mobile app']],
        ['Team', 12, 'Per person', ['Unlimited projects', 'Shared calendar', 'Guests']],
        ['Company', 24, 'Per person', ['Everything in Team', 'Admin controls', 'Priority help']]],
      per: 'month',
    },
    notify: [['Mentions', 'When someone mentions you', true], ['Due soon', 'A day before a task is due', true], ['Weekly summary', 'Every Monday morning', false]],
    planNote: 'seats in use',
  };

  function domainFor(copy) {
    const text = `${copy.brandName} ${copy.tagline}`;
    return DOMAINS.find(d => d.re.test(text)) || DEFAULT_DOMAIN;
  }

  /* ---------------- small helpers ---------------- */

  const e = s => escapeHtml(String(s == null ? '' : s));
  // " · " joins in kit text: the dot gets its own room, since some faces drop the space after it
  const mid = s => e(s).replace(/ · /g, ' <span class="sb-k-mid">·</span> ');
  // A window title for aesthetics that draw cards as windows (Old Web shows it in each
  // card's title bar): 'Revenue this month' -> 'revenue-this.htm'.
  const win = s => ` data-win="${e(String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 2).join('-') + '.htm')}"`;
  const winPanel = s => ` data-win="${e(String(s) + ' Properties')}"`;

  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function slugOf(name) {
    return String(name || 'brand').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '').slice(0, 24) || 'brand';
  }
  function money(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }
  function fmt(n, unit) {
    if (unit === '$') return n >= 10000 ? '$' + (n / 1000).toFixed(1) + 'k' : money(n);
    return n >= 10000 ? (n / 1000).toFixed(1) + 'k' : Math.round(n).toLocaleString('en-US');
  }

  const RANGES = {
    '7d': { n: 7, labels: () => { const d = new Date(); return Array.from({ length: 7 }, (_, i) => new Date(d.getTime() - (6 - i) * 864e5).toLocaleDateString('en-US', { weekday: 'short' })); } },
    '30d': { n: 10, labels: () => { const d = new Date(); return Array.from({ length: 10 }, (_, i) => new Date(d.getTime() - (9 - i) * 3 * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })); } },
    '12m': { n: 12, labels: () => { const d = new Date(); return Array.from({ length: 12 }, (_, i) => new Date(d.getFullYear(), d.getMonth() - 11 + i, 1).toLocaleDateString('en-US', { month: 'short' })); } },
  };

  // A gently rising series for the chart, the same for the same brand and range.
  function seriesFor(name, range, base) {
    const R = RANGES[range] || RANGES['30d'];
    const r = rng(hashStr(name + '|' + range));
    const scale = range === '12m' ? 30 : range === '30d' ? 3 : 1;
    let v = base * scale * (0.72 + r() * 0.1);
    const now = [];
    const prev = [];
    for (let i = 0; i < R.n; i++) {
      v *= 1 + (r() - 0.36) * 0.16;
      now.push(v);
      prev.push(v * (0.78 + r() * 0.12));
    }
    return { now, prev, labels: R.labels() };
  }

  // Smooth path through the points (Catmull-Rom as cubic Béziers), in a 600 x 200 box.
  const CW = 600;
  const CH = 200;
  function chartGeom(series) {
    const all = series.now.concat(series.prev);
    const max = Math.max(...all) * 1.12;
    const min = Math.min(...all) * 0.7;
    const n = series.now.length;
    const pt = (v, i) => [(i / (n - 1)) * CW, CH - ((v - min) / (max - min)) * (CH - 16) - 8];
    const path = vals => {
      const p = vals.map(pt);
      let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i - 1] || p[i];
        const p1 = p[i];
        const p2 = p[i + 1];
        const p3 = p[i + 2] || p2;
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
      }
      return d;
    };
    const line = path(series.now);
    return { line, area: `${line} L${CW},${CH} L0,${CH} Z`, prev: path(series.prev), pts: series.now.map(pt) };
  }

  function chartSvg(series) {
    const g = chartGeom(series);
    const last = g.pts.length - 1;
    const grid = [0.25, 0.5, 0.75].map(f => `<line class="sb-c-grid" x1="0" x2="${CW}" y1="${CH * f}" y2="${CH * f}" vector-effect="non-scaling-stroke"/>`).join('');
    return `<svg class="sb-chart-svg" viewBox="0 0 ${CW} ${CH}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        ${grid}
        <path class="sb-c-area" d="${g.area}"/>
        <path class="sb-c-prev" d="${g.prev}" vector-effect="non-scaling-stroke"/>
        <path class="sb-c-line" d="${g.line}" vector-effect="non-scaling-stroke"/>
        <line class="sb-c-cursor" x1="${g.pts[last][0]}" x2="${g.pts[last][0]}" y1="0" y2="${CH}" vector-effect="non-scaling-stroke"/>
      </svg>
      <span class="sb-c-dot" style="left:${(g.pts[last][0] / CW) * 100}%;top:${(g.pts[last][1] / CH) * 100}%"></span>`;
  }

  // X-axis labels placed under their points: every other one hides when there are many
  // (.sb-x-skip), and only every third shows on a narrow screen (.sb-x-odd).
  function xLabels(labels) {
    const n = labels.length;
    return labels.map((l, i) => {
      const cls = [i % 3 ? 'sb-x-odd' : '', n > 8 && i % 2 ? 'sb-x-skip' : ''].filter(Boolean).join(' ');
      return `<span${cls ? ` class="${cls}"` : ''} style="left:${(i / (n - 1)) * 100}%">${e(l)}</span>`;
    }).join('');
  }

  /* ---------------- icons (line, currentColor) ---------------- */

  const ICO = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.5.8 2.6 2.5 3 5.2"/>',
    box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    chev: '<path d="m9.5 6 6 6-6 6"/>',
    back: '<path d="m14.5 6-6 6 6 6"/>',
    down: '<path d="m6 9.5 6 6 6-6"/>',
    more: '<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.2"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16.2 9.5"/>',
    warn: '<path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.2v.2"/>',
    err: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    inbox: '<path d="M3.5 13.5 6 5h12l2.5 8.5V19h-17z"/><path d="M3.5 13.5H9a3 3 0 0 0 6 0h5.5"/>',
  };
  const icon = (k, size = 18) => `<svg class="sb-ico" data-i="${k}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICO[k] || ''}</svg>`;
  const NAV_ICONS = ['home', 'list', 'users', 'box', 'chart'];
  const TAB_ICONS = ['home', 'list', 'heart', 'user'];

  /* ---------------- shared pieces (branded and generic) ---------------- */

  // X = everything a screen builder needs: copy, the domain vocabulary, a uid and the
  // mode ('brand' renders through the aesthetic, 'generic' is the default-look twin).
  function brandMark(X) {
    if (X.mode === 'brand' && X.logo) return `<img class="ab-logo" src="${e(X.logo)}" alt="${e(X.name)}" />`;
    return `<span class="ab-mark" aria-hidden="true"><span>${e(abInitial(X.name))}</span></span><span class="ab-wordmark">${e(X.name)}</span>`;
  }

  function headline(X, text, extra = '') {
    if (X.mode === 'brand') return abHeadlineH2(X.def, X.ctx, text, extra);
    return `<h2 class="ab-headline${extra}">${abHeadline(text)}</h2>`;
  }


  function cta(label, done, cls = '') {
    return `<button type="button" class="ab-cta ${cls}" data-done="${e(done)}" data-label="${e(label)}"><span class="ab-cta-label">${e(label)}</span><span class="ab-cta-arrow" aria-hidden="true"></span></button>`;
  }

  function seg(items, pressed, group, label) {
    return `<div class="ab-seg" role="group" aria-label="${e(label)}" data-sb="${group}">${items.map(([v, t], i) =>
      `<button type="button" class="ab-seg-btn" aria-pressed="${i === pressed}" data-v="${e(v)}">${e(t)}</button>`).join('')}</div>`;
  }

  function toggle(X, label, on, hint) {
    const id = `${X.uid}-t${++seq}`;
    return `<label class="ab-toggle sb-tog" for="${id}"><span>${e(label)}${hint ? `<small class="sb-hint">${e(hint)}</small>` : ''}</span><input class="ab-switch" id="${id}" type="checkbox"${on ? ' checked' : ''} /></label>`;
  }

  function field(X, label, value, cls = '') {
    const id = `${X.uid}-f${++seq}`;
    return `<div class="sb-field ${cls}"><label class="ab-fieldlabel" for="${id}">${e(label)}</label><input class="ab-input" id="${id}" type="text" value="${e(value)}" autocomplete="off" spellcheck="false" /></div>`;
  }

  function rowsHtml(rows) {
    return `<ul class="ab-list">${rows.map((r, i) => `<li class="ab-row" tabindex="0">
      <span class="ab-row-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="ab-av" aria-hidden="true">${e(r[0][0])}</span>
      <span class="ab-row-name">${e(r[0])}</span>
      <span class="ab-row-status">${e(r[1])}</span>
      <span class="ab-row-bar" aria-hidden="true"><i style="width:${r[2]}%"></i></span>
      <span class="ab-row-pct">${r[2]}%</span>
    </li>`).join('')}</ul>`;
  }

  function labelRow(left, right) {
    return `<div class="ab-labelrow"><span class="ab-label">${left}</span>${right ? `<span class="ab-label">${right}</span>` : ''}</div>`;
  }
  const num = (i, text) => `<i class="ab-n">${String(i).padStart(2, '0')}</i><span>${e(text)}</span>`;

  function sidebar(X, items, active) {
    return `<aside class="sb-side">
        <div class="ab-brand sb-side-brand">${brandMark(X)}</div>
        <nav class="sb-nav" aria-label="${e(X.name)}">${items.map((t, i) =>
          `<button type="button" class="sb-navi" data-title="${e(t)}"${i === active ? ' aria-current="page"' : ''}>${icon(NAV_ICONS[i] || 'list')}<span>${e(t)}</span></button>`).join('')}
          <button type="button" class="sb-navi" data-title="Settings"${active === -1 ? ' aria-current="page"' : ''}>${icon('gear')}<span>Settings</span></button>
        </nav>
        <div class="sb-me"><span class="sb-me-av" aria-hidden="true">${e(X.me[0])}</span><span class="sb-me-name">${e(X.me)}<small>${e(X.role)}</small></span></div>
      </aside>`;
  }

  /* ---------------- 1. dashboard ---------------- */

  function dashboard(X) {
    const D = X.D;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const series = seriesFor(X.name, '30d', D.chart[2]);
    const total = series.now.reduce((a, b) => a + b, 0);
    const stats = D.stats.map(([label, value, delta, good]) => `<div class="ab-card sb-stat"${win(label)}>
          <p class="ab-label">${e(label)}</p>
          <p class="ab-card-title sb-num">${e(value)}</p>
          <span class="ab-fit sb-delta" data-fit="${good ? 'match' : 'consider'}">${e(delta)}</span>
        </div>`).join('');
    const p = D.panel;
    return `<div class="ab-in sb-app" data-sb-kind="dashboard">
      ${sidebar(X, D.nav, 0)}
      <div class="sb-main">
        <header class="sb-top">
          <div class="sb-top-t"><p class="ab-kicker">${e(today)}</p><h2 class="ab-card-title sb-title" data-sb-title>Overview</h2></div>
          <div class="sb-top-tools">
            <div class="sb-search">${icon('search', 16)}<input class="ab-input" type="text" placeholder="${e(D.search)}" aria-label="${e(D.search)}" autocomplete="off" /></div>
            <button type="button" class="ab-type-apply sb-icon-btn" aria-label="Notifications">${icon('bell', 17)}<i class="sb-badge" aria-hidden="true"></i></button>
            ${cta(D.action[0], D.action[1], 'sb-inline')}
          </div>
        </header>
        <div class="ab-rule"></div>
        <div class="sb-stats">${stats}</div>
        <div class="sb-mid">
          <div class="ab-card sb-chart"${win(D.chart[0] + ' chart')} data-sb-chart data-base="${D.chart[2]}" data-unit="${e(D.chart[1])}">
            <div class="sb-chart-head">
              <div><p class="ab-label">${e(D.chart[0])}</p><p class="ab-card-title sb-num sb-chart-total" data-sb-total>${e(fmt(total, D.chart[1]))}</p><p class="ab-card-body sb-readout" data-sb-readout>${e(series.labels[series.labels.length - 1])} · ${e(fmt(series.now[series.now.length - 1], D.chart[1]))}</p></div>
              ${seg([['7d', '7 days'], ['30d', '30 days'], ['12m', '12 months']], 1, 'range', 'Chart range')}
            </div>
            <div class="sb-chart-plot" data-sb-plot>${chartSvg(series)}</div>
            <div class="sb-chart-x" data-sb-x>${xLabels(series.labels)}</div>
            <p class="sb-legend"><span class="sb-lg-now"></span>This period<span class="sb-lg-prev"></span>Previous period</p>
          </div>
          <div class="ab-panel sb-quick"${winPanel(p.title)}>
            <p class="ab-label sb-quick-h">${e(p.title)}</p>
            <label class="ab-fieldlabel" for="${X.uid}-q">${e(p.field[0])}</label>
            <input class="ab-input" id="${X.uid}-q" type="text" value="${e(p.field[1])}" autocomplete="off" />
            ${p.toggles.map(([l, on]) => toggle(X, l, on)).join('')}
            <div class="ab-status" aria-live="polite">Changes save automatically</div>
          </div>
        </div>
        <section class="sb-listsec" aria-label="${e(D.listTitle)}">
          ${labelRow(num(1, D.listTitle), `${D.rows.length} open`)}
          ${rowsHtml(D.rows)}
        </section>
      </div>
    </div>`;
  }

  /* ---------------- 2. mobile app ---------------- */

  // App screens are built from the UI kit only (js/ui-kit.js): no board art, patterns or
  // plates. Each phone screen is laid out at the 390 x 844 reference in UI_KIT_PHONE points;
  // css/see-built.css scales the whole device down to fit.

  function statusBar() {
    return `<div class="sb-statusbar" aria-hidden="true"><span>9:41</span><span class="sb-sb-r"><i class="sb-sig"></i><i class="sb-wifi"></i><i class="sb-bat"></i></span></div>`;
  }

  // One kit list row: lead (icon tile or avatar), title and optional detail, trailing value.
  // A row without a lead (label / value rows) drops the lead column.
  function kRow(r) {
    return `<li class="ab-row sb-k-row${r.picked ? ' is-picked' : ''}${r.lead ? '' : ' is-nolead'}${r.cls ? ' ' + r.cls : ''}" tabindex="0">
        ${r.lead ? `<span class="sb-k-lead">${r.lead}</span>` : ''}
        <span class="sb-k-text"><span class="sb-k-title">${e(r.title)}</span>${r.sub ? `<span class="sb-k-sub">${mid(r.sub)}</span>` : ''}</span>
        ${r.trail != null ? `<span class="sb-k-trail">${r.trail}</span>` : ''}
      </li>`;
  }
  const kList = rows => `<ul class="ab-list sb-k-list">${rows.map(kRow).join('')}</ul>`;
  // A project row on a phone: the name alone as the title (one line in any face), the client
  // and status as the detail. "Brand refresh · Fernwood", "In review" -> "Brand refresh", "Fernwood · In review".
  const kProject = (r, extra) => {
    const [name, client] = String(r[0]).split(' · ');
    return Object.assign({ lead: kAv(name[0], 's'), title: name, sub: client ? `${client} · ${r[1]}` : r[1], trail: `${r[2]}%${chev()}` }, extra || {});
  };
  const kIco = k => `<span class="sb-k-ico">${icon(k, 18)}</span>`;
  const kAv = (t, size = '') => `<span class="sb-k-av${size ? ' sb-k-av-' + size : ''}" aria-hidden="true">${e(t)}</span>`;
  const chev = () => `<span class="sb-k-chev">${icon('chev', 16)}</span>`;
  // A section label; `action` (e.g. 'See all') is a text button at its right end, `note` a plain label.
  const kSection = (left, action, note) => `<div class="ab-labelrow sb-k-section"><span class="ab-label">${e(left)}</span>${action ? `<button type="button" class="sb-k-textbtn sb-k-see">${e(action)}</button>` : note ? `<span class="ab-label">${e(note)}</span>` : ''}</div>`;
  const tabBar = (tabs) => `<nav class="sb-tabs" aria-label="App">${tabs.map((t, i) =>
    `<button type="button" class="sb-tab"${i === 0 ? ' aria-current="page"' : ''}>${icon(TAB_ICONS[i], 24)}<span>${e(t)}</span></button>`).join('')}</nav>`;

  function mobileOnboard(X) {
    const M = X.D.mobile;
    const feats = X.D.landing.features.slice(0, 3);
    const ICONS = ['check', 'bell', 'heart'];
    return `<div class="sb-phone-in sb-onboard">
        ${statusBar()}
        <div class="sb-ob-top"><div class="ab-brand">${brandMark(X)}</div><button type="button" class="sb-k-textbtn">Skip</button></div>
        <div class="sb-ob-main">
          <div class="sb-ob-copy">
            <p class="ab-kicker">Welcome</p>
            ${headline(X, X.welcomeTitle || M.welcome, ' sb-ob-h')}
            <p class="ab-subcopy sb-ob-body">${e(M.body)}</p>
          </div>
          <div class="sb-ob-list">${kList(feats.map(([t], i) => ({ lead: kIco(ICONS[i]), title: t })))}</div>
        </div>
        <div class="sb-dots" aria-hidden="true"><i class="is-on"></i><i></i><i></i></div>
        <div class="sb-ob-actions">
          ${cta('Get started', 'Setting things up', 'sb-k-btn')}
          <button type="button" class="ab-type-apply sb-k-btn2">I have an account</button>
        </div>
        <div class="sb-homebar" aria-hidden="true"></div>
      </div>`;
  }

  function mobileHome(X) {
    const M = X.D.mobile;
    return `<div class="sb-phone-in sb-home">
        ${statusBar()}
        <div class="sb-home-top">
          <div class="sb-home-t"><p class="ab-kicker">${e(M.hello)}</p><h2 class="ab-card-title sb-home-h">Hi, ${e(X.me.split(' ')[0])}</h2></div>
          <button type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn" aria-label="Notifications">${icon('bell', 20)}<i class="sb-badge" aria-hidden="true"></i></button>
        </div>
        <div class="ab-card sb-home-card sb-k-card"${win(M.card[0])}>
          ${seg(M.seg.map((s, i) => [String(i), s]), 0, 'mseg', 'Show')}
          <h3 class="ab-card-title">${e(M.card[0])}</h3>
          <p class="ab-card-body">${mid(M.card[1])}</p>
          ${cta(M.cta[0], M.cta[1], 'sb-k-btn')}
        </div>
        <section class="sb-home-list" aria-label="${e(M.listTitle)}">
          ${kSection(M.listTitle, 'See all')}
          ${kList(M.rows.map(r => kProject(r)))}
        </section>
        ${tabBar(M.tabs)}
        <div class="sb-homebar" aria-hidden="true"></div>
      </div>`;
  }

  /* ---------------- 3. landing page ---------------- */

  // The hero shows the product, never the board's illustration: the Home phone from the Mobile
  // tab, in its own kit root at the 390 x 844 reference, scaled down as a whole device on a soft
  // field of the brand primary. inert: it is a picture of the app, not part of the page.
  function heroShot(X) {
    const open = X.mode === 'brand' ? cls => X.P.rootOpen('sb-ab ' + cls) : genericOpen;
    return `<div class="sb-lhero-shot" aria-hidden="true" inert><div class="sb-dev"><div class="sb-phone-frame"><span class="sb-island" aria-hidden="true"></span>${open('sb-screen sb-kit')}${mobileHome(X)}</section></div></div></div>`;
  }

  function landing(X) {
    const L = X.D.landing;
    const plans = L.plans.map(([name, price, blurb, perks], i) => {
      const featured = i === 1;
      const priceTxt = (yearly) => {
        if (L.per === 'from') return `<span class="sb-from">from</span> ${money(price)}`;
        if (!price) return '$0';
        return money(yearly ? Math.round(price * 0.8) : price);
      };
      return `<div class="ab-card sb-plan${featured ? ' is-featured' : ''}"${win(name)}>
          <div class="sb-plan-top"><p class="ab-label">${e(name)}</p>${featured ? '<span class="ab-fit" data-fit="match">Most popular</span>' : ''}</div>
          <p class="ab-card-title sb-price"><span data-sb-price data-m="${e(priceTxt(false))}" data-y="${e(priceTxt(true))}">${priceTxt(false)}</span>${L.per === 'from' ? '' : `<small> / ${e(L.per)}</small>`}</p>
          <p class="ab-card-body">${e(blurb)}</p>
          <ul class="sb-perks">${perks.map(p => `<li>${icon('check', 15)}<span>${e(p)}</span></li>`).join('')}</ul>
          ${featured ? cta(L.cta[0], L.cta[1]) : `<button type="button" class="ab-type-apply sb-wide">${price ? 'Choose ' + e(name) : 'Start free'}</button>`}
        </div>`;
    }).join('');
    const year = new Date().getFullYear();
    return `<div class="ab-in sb-page" data-sb-kind="landing">
      <header class="ab-head sb-lnav">
        <div class="ab-brand">${brandMark(X)}</div>
        <nav class="sb-links" aria-label="Site"><a href="#" data-sb-nolink>Features</a><a href="#" data-sb-nolink>Pricing</a><a href="#" data-sb-nolink>About</a><a href="#" data-sb-nolink>Journal</a></nav>
        <button type="button" class="ab-type-apply sb-signin">Sign in</button>
      </header>
      <div class="ab-rule"></div>
      <section class="ab-hero sb-lhero">
        <div class="ab-hero-copy">
          <p class="ab-kicker">${e(L.kicker)}</p>
          ${headline(X, X.tagline)}
          <p class="ab-subcopy">${e(L.pitch(X.name))}</p>
          <div class="sb-hero-act">${cta(L.cta[0], L.cta[1], 'sb-inline')}<button type="button" class="ab-type-apply">${e(L.second)}</button></div>
          <p class="sb-proof">${icon('check', 15)}<span>Trusted by 2,400 customers · Rated 4.9 out of 5</span></p>
        </div>
        ${heroShot(X)}
      </section>
      <div class="ab-rule"></div>
      <section class="sb-features" aria-label="Features">
        ${labelRow(num(1, 'Why ' + X.name), '')}
        <div class="sb-feat-grid">${L.features.map(([t, b], i) => `<div class="ab-card sb-feat"${win(t)}>
            <span class="sb-feat-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
            <h3 class="ab-card-title">${e(t)}</h3>
            <p class="ab-card-body">${e(b)}</p>
          </div>`).join('')}</div>
      </section>
      <section class="sb-pricing" aria-label="Pricing">
        <div class="sb-pricing-head">
          ${labelRow(num(2, 'Pricing'), '')}
          ${L.per === 'from' ? '' : seg([['m', 'Monthly'], ['y', 'Yearly · save 20%']], 0, 'billing', 'Billing')}
        </div>
        <div class="sb-plan-grid">${plans}</div>
      </section>
      <footer class="ab-foot sb-lfoot">
        <span class="ab-motto"><i class="ab-dot" aria-hidden="true"></i>${e(X.name)} · ${e(X.tagline)}</span>
        <span class="ab-infl">© ${year} ${e(X.name)} · Privacy · Terms · Contact</span>
      </footer>
    </div>`;
  }

  /* ---------------- 4. settings ---------------- */

  function settings(X) {
    const D = X.D;
    const plan = D.landing.plans[1];
    const slug = slugOf(X.name);
    return `<div class="ab-in sb-app" data-sb-kind="settings">
      ${sidebar(X, D.nav, -1)}
      <div class="sb-main sb-set">
        <header class="sb-top">
          <div class="sb-top-t"><p class="ab-kicker">${e(X.name)} workspace</p><h2 class="ab-card-title sb-title" data-sb-title>Settings</h2></div>
          <div class="sb-top-tools"><button type="button" class="ab-type-apply">Cancel</button>${cta('Save changes', 'Saved', 'sb-inline')}</div>
        </header>
        <div class="ab-rule"></div>
        <div class="sb-set-grid">
          <section class="sb-set-sec" aria-label="Profile">
            <div class="sb-set-intro">${labelRow(num(1, 'Profile'), '')}<p class="ab-card-body">How ${e(X.name)} appears to customers and in emails.</p></div>
            <div class="ab-panel sb-set-panel"${winPanel('Profile')}>
              ${field(X, 'Workspace name', X.name)}
              <div class="sb-field-row">${field(X, 'Website', slug + '.com')}${field(X, 'Support email', 'hello@' + slug + '.com')}</div>
              ${field(X, 'Tagline', X.tagline)}
            </div>
          </section>
          <section class="sb-set-sec" aria-label="Notifications">
            <div class="sb-set-intro">${labelRow(num(2, 'Notifications'), '')}<p class="ab-card-body">Choose what is worth interrupting you for.</p></div>
            <div class="ab-panel sb-set-panel"${winPanel('Notifications')}>
              ${D.notify.map(([l, h, on]) => toggle(X, l, on, h)).join('')}
              <div class="ab-status" aria-live="polite">${D.notify.filter(n => n[2]).length} of ${D.notify.length} on</div>
            </div>
          </section>
          <section class="sb-set-sec" aria-label="Appearance">
            <div class="sb-set-intro">${labelRow(num(3, 'Appearance'), '')}<p class="ab-card-body">Applies to everyone in the workspace.</p></div>
            <div class="ab-panel sb-set-panel"${winPanel('Appearance')}>
              <p class="ab-fieldlabel">Theme</p>
              ${seg([['light', 'Light'], ['dark', 'Dark'], ['auto', 'Automatic']], 2, 'theme', 'Theme')}
              <p class="ab-fieldlabel sb-gap">Density</p>
              ${seg([['c', 'Comfortable'], ['k', 'Compact']], 0, 'density', 'Density')}
            </div>
          </section>
          <section class="sb-set-sec" aria-label="Plan">
            <div class="sb-set-intro">${labelRow(num(4, 'Plan'), '')}<p class="ab-card-body">Billed monthly. Change or cancel any time.</p></div>
            <div class="ab-card sb-planbox"${win('plan')}>
              <div class="sb-plan-top"><h3 class="ab-card-title">${e(plan[0])}</h3><span class="ab-fit" data-fit="match">Current plan</span></div>
              <p class="ab-card-body">${e(plan[2])} · renews on the 1st</p>
              <div class="sb-usage"><span class="ab-row-bar" aria-hidden="true"><i style="width:68%"></i></span><span class="ab-label">68% of ${e(D.planNote)}</span></div>
              <button type="button" class="ab-type-apply">Compare plans</button>
            </div>
          </section>
          <section class="sb-set-sec sb-danger" aria-label="Danger zone">
            <div class="sb-set-intro">${labelRow(num(5, 'Danger zone'), '')}<p class="ab-card-body">These cannot be undone.</p></div>
            <div class="sb-danger-box">
              <div class="sb-danger-row"><div><b>Pause ${e(X.name)}</b><p>Hide everything from customers until you switch it back on.</p></div><button type="button" class="sb-danger-btn" data-sb-danger="pause">Pause</button></div>
              <div class="sb-danger-row"><div><b>Delete workspace</b><p>Removes all projects, customers and history for good.</p></div><button type="button" class="sb-danger-btn is-solid" data-sb-danger="delete">Delete workspace</button></div>
              <p class="sb-danger-note" aria-live="polite"></p>
            </div>
          </section>
        </div>
      </div>
    </div>`;
  }

  /* ---------------- 5. UI kit ---------------- */

  // Every UI_KIT component (js/ui-kit.js) in every listed state, drawn from the board's own
  // component classes plus the sb-k-* pieces in css/see-built.css, so the aesthetic styles it.
  // Sizes come from UI_KIT_PHONE (custom properties set on #builtView by render()).
  const kBtn = (cls, label, st) => `<button type="button" class="${cls}${st === 'pressed' ? ' is-pressed sb-k-pressed' : ''}"${st === 'disabled' ? ' disabled' : ''}>${label}</button>`;
  const ctaInner = label => `<span class="ab-cta-label">${e(label)}</span><span class="ab-cta-arrow" aria-hidden="true"></span>`;

  // Top bar: leading control, centred title, trailing control; an empty side keeps its 44pt slot.
  const kPlain = (k, label) => `<button type="button" class="sb-k-plain" aria-label="${e(label)}">${icon(k, 22)}</button>`;
  const kTopbar = (lead, title, trail) => `<div class="sb-k-topbar">${lead || '<span></span>'}<span class="sb-k-tb-title">${title || ''}</span>${trail || '<span></span>'}</div>`;

  const KIT_SPEC = {
    'btn-primary': (X, st) => kBtn('ab-cta sb-k-btn', ctaInner('Continue'), st),
    'btn-secondary': (X, st) => kBtn('ab-type-apply sb-k-btn2', 'Not now', st),
    'btn-text': (X, st) => kBtn('sb-k-textbtn', 'See all', st),
    'btn-destructive': (X, st) => kBtn('sb-k-danger', 'Delete', st),
    'btn-icon': (X, st) => kBtn('ab-type-apply sb-icon-btn sb-k-iconbtn', icon('bell', 20), st).replace('<button', '<button aria-label="Notifications"'),
    field: (X, st) => {
      const id = `${X.uid}-kf${++seq}`;
      const val = st === 'error' ? 'hello@' : st === 'rest' ? '' : 'maya@' + slugOf(X.name) + '.com';
      return `<div class="sb-field sb-k-field is-${st}"><label class="ab-fieldlabel" for="${id}">Email</label><input class="ab-input" id="${id}" type="text" value="${e(val)}" placeholder="you@example.com" autocomplete="off" spellcheck="false"${st === 'disabled' ? ' disabled' : ''}${st === 'error' ? ' aria-invalid="true"' : ''} />${st === 'error' ? '<p class="sb-k-help is-error">Enter a full email address.</p>' : ''}</div>`;
    },
    search: (X, st) => `<div class="sb-search sb-k-search is-${st}">${icon('search', 18)}<input class="ab-input" type="text" placeholder="${e(X.D.search)}" value="${st === 'focus' ? e(X.D.rows[0][0].split(' ')[0]) : ''}" aria-label="${e(X.D.search)}" autocomplete="off" /></div>`,
    select: (X, st) => {
      const opts = X.D.mobile.seg.concat(['Everything']);
      return `<div class="sb-k-selectwrap"><p class="ab-fieldlabel">Show</p><button type="button" class="ab-input sb-k-select" aria-haspopup="listbox" aria-expanded="${st === 'open'}"><span>${e(opts[0])}</span>${icon('down', 18)}</button>${st === 'open' ? `<ul class="sb-k-menu" role="listbox">${opts.map((o, i) => `<li role="option" aria-selected="${i === 0}"><span>${e(o)}</span>${i === 0 ? icon('check', 18) : ''}</li>`).join('')}</ul>` : ''}</div>`;
    },
    checkbox: (X, st) => `<label class="sb-k-check"><input class="sb-k-box" type="checkbox"${st === 'on' ? ' checked' : ''} /><span>Email me receipts</span></label>`,
    radio: (X, st) => `<label class="sb-k-check"><input class="sb-k-box" type="radio" name="${X.uid}-kr${++seq}"${st === 'on' ? ' checked' : ''} /><span>${st === 'on' ? 'Weekly' : 'Daily'}</span></label>`,
    toggle: (X, st) => toggle(X, 'Push notifications', st === 'on'),
    segmented: (X) => seg(X.D.mobile.seg.concat(['All']).map((s, i) => [String(i), s]), 0, 'kseg', 'Show'),
    slider: () => `<div class="sb-k-slider"><div class="sb-k-slider-h"><span>Volume</span><span data-sb-range-out>60%</span></div><input class="sb-k-range" type="range" min="0" max="100" value="60" style="--v:60%" aria-label="Volume" /></div>`,
    card: (X) => {
      const M = X.D.mobile;
      return `<div class="ab-card sb-k-card"${win(M.card[0])}>${seg(M.seg.map((s, i) => [String(i), s]), 0, 'kcseg', 'Show')}<h3 class="ab-card-title">${e(M.card[0])}</h3><p class="ab-card-body">${mid(M.card[1])}</p>${cta(M.cta[0], M.cta[1], 'sb-k-btn')}</div>`;
    },
    list: (X, st) => {
      const rows = X.D.mobile.rows.map((r, i) => kProject(r, { picked: st === 'pressed' && i === 1 }));
      return kList(st === 'pressed' ? rows.slice(1, 2) : rows);
    },
    callout: (X, st) => {
      const C = {
        info: ['info', 'Heads up', 'Prices change on the first of next month.'],
        success: ['ok', 'Saved', 'Your changes are live for everyone.'],
        warning: ['warn', 'Almost full', 'You have used 90% of your storage.'],
        error: ['err', 'Payment failed', 'Update your card to keep your plan.'],
      }[st];
      return `<div class="sb-k-callout" data-tone="${st}" role="${st === 'error' ? 'alert' : 'status'}">${icon(C[0], 20)}<div><b>${C[1]}</b><span>${C[2]}</span></div></div>`;
    },
    sheet: (X) => `<div class="sb-k-sheetbox"><div class="sb-k-sheet" role="dialog" aria-label="Leave without saving?"><span class="sb-k-grab" aria-hidden="true"></span><h3 class="ab-card-title sb-k-sheet-t">Leave without saving?</h3><p class="sb-k-sheet-b">Your changes to this ${e(X.D.listTitle.split(' ')[0].toLowerCase())} will be lost.</p><div class="sb-k-sheet-a">${kBtn('ab-cta sb-k-btn', ctaInner('Keep editing'))}${kBtn('ab-type-apply sb-k-btn2', 'Discard')}</div></div></div>`,
    divider: (X) => `<div class="sb-k-divider">${kSection(X.D.mobile.listTitle, '', '3 items')}<p class="sb-k-para">Rows in a group sit under one section label.</p><div class="ab-rule"></div><p class="sb-k-para">A rule separates groups.</p></div>`,
    topbar: () => kTopbar(kPlain('back', 'Back'), e('Settings'), kPlain('more', 'More')),
    tabbar: (X) => `<div class="sb-k-tabbarbox">${tabBar(X.D.mobile.tabs)}</div>`,
    tabs: (X) => `<div class="sb-k-tabs" role="tablist">${['Overview', 'Activity', 'Members'].map((t, i) => `<button type="button" role="tab" aria-selected="${i === 0}">${t}</button>`).join('')}</div>`,
    badge: (X, st) => st === 'accent'
      ? `<div class="sb-k-row-inline"><span class="sb-k-badge">New</span><span class="sb-k-count is-accent">3</span><span class="sb-k-dotwrap">${icon('bell', 22)}<i class="sb-badge" aria-hidden="true"></i></span></div>`
      : `<div class="sb-k-row-inline"><span class="ab-fit">Draft</span><span class="ab-fit" data-fit="match">${e(X.D.mobile.rows[0][1])}</span><span class="sb-k-count">12</span></div>`,
    progress: () => `<div class="sb-k-progress"><div class="sb-k-slider-h"><span>Uploading 3 files</span><span>62%</span></div><span class="ab-row-bar sb-k-bar" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100"><i style="width:62%"></i></span></div>`,
    toast: (X) => `<div class="sb-k-toast" role="status">${icon('check', 20)}<span>${e(X.D.mobile.cta[1])}</span><button type="button">Undo</button></div>`,
    empty: (X) => `<div class="sb-k-empty"><span class="sb-k-emptyico" aria-hidden="true">${icon('inbox', 26)}</span><h3 class="ab-card-title sb-k-empty-t">Nothing here yet</h3><p class="sb-k-empty-b">When you add your first one, it shows up here.</p>${kBtn('ab-type-apply sb-k-btn2 sb-k-auto', icon('plus', 18) + '<span>' + e(X.D.action[0]) + '</span>')}</div>`,
    avatar: (X) => {
      const ppl = ['Maya Ortiz', 'Sam Okafor', 'Lena Fischer', 'Jonah Reyes'];
      const ini = n => n.split(' ').map(w => w[0]).join('');
      return `<div class="sb-k-row-inline">${kAv(ini(ppl[0]), 's')}${kAv(ini(ppl[1]))}${kAv(ini(ppl[2]), 'l')}<span class="sb-k-avs">${ppl.map(p => kAv(ini(p), 's')).join('')}</span></div>`;
    },
  };
  // Components that read better across two grid columns.
  const KIT_WIDE = new Set(['field', 'callout', 'list', 'sheet', 'tabbar', 'select']);
  const KIT_ROLES = [
    ['canvas', 'Canvas', 'Screen background'], ['ink', 'Ink', 'Text and icons'],
    ['primary', 'Primary', 'The one main action, selected states'], ['secondary', 'Secondary', 'Supporting fills, avatars, tags'],
    ['accent', 'Accent', 'Badges and highlights'],
  ];

  // item.ios: 'native:<SwiftUI view>' (the system control, tinted) or 'custom' (drawn from tokens).
  function iosTag(ios) {
    if (!ios) return '';
    const native = /^native:/.test(ios);
    const view = native ? ios.slice(7).trim() : '';
    return `<p class="sb-k-ios" data-ios="${native ? 'native' : 'custom'}"><span class="sb-k-ios-tag">${native ? 'Native' : 'Custom'}</span>${native ? `<code>${e(view)}</code>` : '<span>Drawn from the brand tokens</span>'}</p>`;
  }

  /* Screen layouts: one small phone per UI_KIT_SCREENS pattern, built strictly from its blocks
     (UI_KIT ids, or 'title' / 'body' / 'section' type roles) with the same kit markup as the
     Mobile app tab, at the 390 x 844 reference, scaled down as a whole device. No art. */
  function screenBlocks(X, scr) {
    const M = X.D.mobile;
    const r0 = M.rows[0];
    const lv = rows => kList(rows.map(([t, v]) => ({ title: t, trail: `${e(v)}${chev()}` })));
    const sections = { settings: ['General', 'About'], list: [M.seg[0]], detail: ['Details'] }[scr.id] || ['Section'];
    let nSec = 0, nList = 0, nField = 0;
    const B = {
      topbar: () => ({
        onboarding: kTopbar('', `<span class="ab-brand sb-k-tb-brand">${brandMark(X)}</span>`, ''),
        list: kTopbar('', '', kPlain('plus', X.D.action[0])),
        detail: kTopbar(kPlain('back', 'Back'), '', kPlain('more', 'More')),
        form: kTopbar(kPlain('back', 'Back'), '', ''),
        settings: kTopbar(kPlain('back', 'Back'), '', ''),
      }[scr.id] || kTopbar(kPlain('back', 'Back'), '', '')),
      title: () => scr.id === 'onboarding' ? headline(X, X.welcomeTitle || M.welcome, ' sb-ob-h')
        : `<h2 class="ab-card-title sb-k-ltitle">${e({ list: M.listTitle, detail: r0[0], form: X.D.action[0], settings: 'Settings' }[scr.id] || scr.name)}</h2>`,
      body: () => `<p class="ab-subcopy sb-ob-body">${e(M.body)}</p>`,
      section: () => kSection(sections[Math.min(nSec++, sections.length - 1)], '', scr.id === 'list' ? `${M.rows.length + X.D.rows.length} items` : ''),
      list: () => {
        const n = nList++;
        if (scr.id === 'onboarding') return kList(X.D.landing.features.slice(0, 3).map(([t], i) => ({ lead: kIco(['check', 'bell', 'heart'][i]), title: t })));
        if (scr.id === 'list') return kList(M.rows.concat(X.D.rows).map(r => kProject(r)));
        if (scr.id === 'detail') return lv([['Status', r0[1]], ['Owner', X.me], ['Updated', 'Today'], ['Progress', `${r0[2]}%`], [X.D.panel.field[0], X.D.panel.field[1]]]);
        if (scr.id === 'settings') {
          if (n) return lv([['Help', ''], ['Privacy', ''], ['Version', '2.4']]);
          // the Notifications toggle is the group's last row (label plus its control), inside the card
          const rows = [['Name', X.me], ['Language', 'English']].map(([t, v]) => ({ title: t, trail: `${e(v)}${chev()}` }));
          rows.push({ title: 'Notifications', trail: `<input class="ab-switch" type="checkbox" checked aria-label="Notifications" />`, cls: 'sb-k-togrow' });
          return kList(rows);
        }
        return kList(M.rows.map(r => ({ title: String(r[0]).split(' · ')[0], trail: chev() })));
      },
      'btn-primary': () => scr.id === 'onboarding' ? cta('Get started', 'Setting things up', 'sb-k-btn')
        : scr.id === 'form' ? cta('Save', 'Saved', 'sb-k-btn') : cta(M.cta[0], M.cta[1], 'sb-k-btn'),
      'btn-text': () => `<button type="button" class="sb-k-textbtn sb-k-center">I have an account</button>`,
      'btn-destructive': () => kBtn('sb-k-danger', 'Sign out'),
      search: () => KIT_SPEC.search(X, 'rest'),
      segmented: () => KIT_SPEC.segmented(X),
      badge: () => `<div class="sb-k-row-inline"><span class="ab-fit">${e(r0[1])}</span></div>`,
      card: () => `<div class="ab-card sb-k-card"${win(r0[0])}><h3 class="ab-card-title">${r0[2]}% done</h3><p class="ab-card-body">${mid(M.card[1])}</p></div>`,
      field: () => nField++ === 0 ? field(X, 'Name', M.card[0], 'sb-k-field is-rest') : field(X, 'Details', M.card[1], 'sb-k-field is-rest'),
      select: () => KIT_SPEC.select(X, 'rest'),
      toggle: () => scr.id === 'settings' ? '' : toggle(X, X.D.notify[0][0], true),   // settings: a row in its list
      callout: () => KIT_SPEC.callout(X, 'info'),
      tabbar: () => tabBar(M.tabs),
    };
    return scr.blocks.map(id => {
      const draw = B[id] || (KIT_SPEC[id] ? () => KIT_SPEC[id](X, 'rest') : () => '');
      const fill = id === 'list' && (scr.id === 'list' || scr.id === 'detail');
      const html = draw();
      return html ? `<div class="sb-k-blk${fill ? ' sb-k-fill' : ''}" data-blk="${e(id)}">${html}</div>` : '';
    }).join('');
  }

  function kitScreens(X) {
    const list = typeof UI_KIT_SCREENS !== 'undefined' ? UI_KIT_SCREENS : [];
    return list.map(scr => `<figure class="sb-k-layout" data-scr="${e(scr.id)}">
        <div class="sb-dev"><div class="sb-phone-frame"><span class="sb-island" aria-hidden="true"></span>
          <div class="sb-k-scr" data-scr="${e(scr.id)}"><div class="sb-phone-in sb-k-scr-in">${statusBar()}${screenBlocks(X, scr)}<div class="sb-homebar" aria-hidden="true"></div></div></div>
        </div></div>
        <figcaption class="sb-k-layout-cap">
          <h3 class="sb-k-name">${e(scr.name)}</h3>
          <p class="sb-k-use">${e(scr.use)}</p>
          <ul class="sb-k-rules">${scr.rules.map(r => `<li>${e(r)}</li>`).join('')}</ul>
        </figcaption>
      </figure>`).join('');
  }

  function kit(X) {
    const groups = (typeof UI_KIT !== 'undefined' ? UI_KIT : []).map((g, gi) => `<section class="sb-k-group" aria-label="${e(g.group)}">
        ${labelRow(num(gi + 1, g.group), `${g.items.length} components`)}
        <div class="sb-k-grid">${g.items.map(it => {
          const draw = KIT_SPEC[it.id];
          const states = it.states.map(st => `<div class="sb-k-state"><div class="sb-k-spec">${draw ? draw(X, st) : ''}</div><span class="sb-k-slabel">${e(st)}</span></div>`).join('');
          return `<article class="sb-k-cell${KIT_WIDE.has(it.id) ? ' is-wide' : ''}" data-k="${e(it.id)}">
            <header class="sb-k-cell-h"><h3 class="sb-k-name">${e(it.name)}</h3><p class="sb-k-use">${e(it.use)}</p>${iosTag(it.ios)}</header>
            <div class="sb-k-states" data-n="${it.states.length}">${states}</div>
          </article>`;
        }).join('')}</div>
      </section>`).join('');
    const K = typeof UI_KIT_PHONE !== 'undefined' ? UI_KIT_PHONE : { type: [] };
    const sample = r => r.face === 'display' ? X.D.mobile.welcome : r.size >= 16 ? X.D.mobile.card[1] : X.D.mobile.body;
    const typeRows = K.type.map(r => `<div class="sb-k-type-row">
        <div class="sb-k-type-meta"><b>${e(r.role)}</b><span>${r.size} / ${r.line} · ${r.face} face · ${r.weight}</span></div>
        <p class="sb-k-type-sample" style="font-family:var(${r.face === 'display' ? '--ab-font-h' : '--ab-font-b'});font-size:${r.size}px;line-height:${r.line}px;font-weight:${r.weight}">${e(sample(r))}</p>
      </div>`).join('');
    const hexOf = k => X.mode === 'brand' ? (X.P.t && X.P.t[k]) || '' : (GENERIC_VARS['--ab-' + k] || '');
    const swatches = KIT_ROLES.map(([k, name, job]) => `<div class="sb-k-swatch"><span class="sb-k-chip" style="background:var(--ab-${k})"></span><b>${name}</b><span>${job}</span><code>${e(String(hexOf(k)).toUpperCase())}</code></div>`).join('');
    const sizes = K.margin ? `Screen ${K.screen.w} × ${K.screen.h} · margin ${K.margin} · button ${K.buttonHeight} · field ${K.fieldHeight} · row ${K.rowHeight} · card padding ${K.cardPadding} · section gap ${K.sectionGap} · tab bar ${K.tabBarHeight} · tap target ${K.tapTarget}` : '';
    const rule = typeof UI_KIT_SURFACES !== 'undefined' ? UI_KIT_SURFACES.app.rule : '';
    return `<div class="ab-in sb-kitpage" data-sb-kind="kit">
      <header class="sb-k-head">
        <p class="ab-kicker">${e(X.name)} · ${e(X.mode === 'brand' ? X.def.name : 'Generic')}</p>
        <h2 class="ab-card-title sb-k-pagetitle">UI kit</h2>
        <p class="sb-k-intro">${e(rule)}</p>
      </header>
      <div class="ab-rule"></div>
      ${groups}
      <section class="sb-k-group" aria-label="Screen layouts">
        ${labelRow(num(6, 'Screen layouts'), `${typeof UI_KIT_SCREENS !== 'undefined' ? UI_KIT_SCREENS.length : 0} patterns · 390 × 844`)}
        <div class="sb-k-layouts">${kitScreens(X)}</div>
      </section>
      <section class="sb-k-group" aria-label="Phone type scale">
        ${labelRow(num(7, 'Phone type scale'), 'points at 390 × 844')}
        <div class="sb-k-typescale">${typeRows}</div>
        <p class="sb-k-sizes">${e(sizes)}</p>
      </section>
      <section class="sb-k-group" aria-label="Colour roles">
        ${labelRow(num(8, 'Colour roles'), '')}
        <div class="sb-k-swatches">${swatches}</div>
      </section>
    </div>`;
  }

  /* ---------------- assembly ---------------- */

  const BUILDERS = { dashboard, landing, settings, kit };

  // Generic look: system UI type, indigo action, white cards, soft grey borders.
  const GENERIC_VARS = {
    '--ab-canvas': '#ffffff', '--ab-ink': '#111827', '--ab-muted': '#6b7280', '--ab-line': '#e5e7eb',
    '--ab-primary': '#6366f1', '--ab-on-primary': '#ffffff', '--ab-secondary': '#a5b4fc', '--ab-on-secondary': '#111827',
    '--ab-accent': '#8b5cf6', '--ab-on-accent': '#ffffff', '--ab-pri-tint': '#eef2ff', '--ab-sec-tint': '#eef2ff',
    '--ab-accent-text': '#6366f1', '--ab-primary-text': '#6366f1', '--ab-accent-ink': '#6366f1',
    '--ab-font-h': 'var(--sb-sys)', '--ab-font-b': 'var(--sb-sys)', '--ab-font-ui': 'var(--sb-sys)', '--ab-font-label': 'var(--sb-sys)',
    '--ab-hl-scale': 1, '--ab-hs': 1, '--ab-display': 1, '--ab-tr': 1,
  };

  function genericOpen(extraClass) {
    return `<section class="sb-gen ${extraClass}" data-mode="light" style="${abStyle(GENERIC_VARS)}">`;
  }

  function screens(X, kind) {
    const open = X.mode === 'brand' ? cls => X.P.rootOpen('sb-ab ' + cls) : genericOpen;
    if (kind === 'mobile') {
      // The screen is laid out at the true 390 x 844 reference and the whole device is scaled
      // down (css --sb-phone-scale), so type, spacing and the frame keep real iPhone proportions.
      const phone = (body, cap) => `<figure class="sb-phone"><div class="sb-dev"><div class="sb-phone-frame"><span class="sb-island" aria-hidden="true"></span>${open('sb-screen sb-kit')}${body}</section></div></div><figcaption>${cap}</figcaption></figure>`;
      // Under the before / after divider a pair of phones would put a different screen on each
      // side, so the comparison shows one phone (the home screen) split down the middle.
      if (SB.before) return `<div class="sb-phones">${phone(mobileHome(X), 'Home')}</div>`;
      return `<div class="sb-phones">${phone(mobileOnboard(X), 'Welcome')}${phone(mobileHome(X), 'Home')}</div>`;
    }
    return `${open(kind === 'kit' ? 'sb-window sb-kit' : 'sb-window')}${BUILDERS[kind](X)}</section>`;
  }

  function contextFor(mode, st) {
    const v = st ? abView(st) : abView();
    const P = abBoardParts(v.state, v.def);
    const copy = P.copy;
    const D = domainFor(copy);
    const people = ['Maya Ortiz', 'Sam Okafor', 'Lena Fischer', 'Jonah Reyes', 'Priya Nair', 'Theo Laurent'];
    const me = people[hashStr(copy.brandName) % people.length];
    return {
      mode, v, P, def: v.def, ctx: P.ctx, D,
      name: copy.brandName, tagline: copy.tagline, logo: v.state.logoDataUrl,
      me, role: 'Owner', uid: `sb${++seq}${mode[0]}`,
      // the Welcome title is the brand's own tagline when it has one (the sample line otherwise)
      welcomeTitle: String(((v.state.content || {}).tagline) || '').replace(/\s+/g, ' ').trim(),
    };
  }

  function barHtml(def) {
    const kinds = KINDS.map(([k, label]) =>
      `<button type="button" class="sb-kind" data-kind="${k}" aria-pressed="${k === SB.kind}">${label}</button>`).join('');
    return `<div class="sb-bar">
        <div class="sb-kinds" role="group" aria-label="Product type">${kinds}</div>
        <button type="button" class="sb-ba-btn" aria-pressed="${SB.before}">
          <span class="sb-ba-ico" aria-hidden="true"></span>Before and after
        </button>
      </div>`;
  }

  // UI_KIT_PHONE as custom properties (--k-margin, --k-btn, --k-body, --k-body-lh ...), so the
  // contract in js/ui-kit.js is the one source of the phone and kit sizes in css/see-built.css.
  function kitVars() {
    if (typeof UI_KIT_PHONE === 'undefined') return {};
    const K = UI_KIT_PHONE;
    const v = {
      '--k-margin': K.margin + 'px', '--k-btn': K.buttonHeight + 'px', '--k-field': K.fieldHeight + 'px',
      '--k-row': K.rowHeight + 'px', '--k-cardpad': K.cardPadding + 'px', '--k-gap': K.sectionGap + 'px',
      '--k-tab': K.tabBarHeight + 'px', '--k-tap': K.tapTarget + 'px',
    };
    K.type.forEach(r => {
      const k = r.role.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      v[`--k-${k}`] = r.size + 'px';
      v[`--k-${k}-lh`] = r.line + 'px';
    });
    return v;
  }

  function render() {
    const host = document.getElementById('builtView');
    if (!host) return;
    if (typeof setBoardFonts === 'function') setBoardFonts(host);
    Object.entries(kitVars()).forEach(([k, val]) => host.style.setProperty(k, val));
    const brand = contextFor('brand');
    const brandHtml = screens(brand, SB.kind);
    let stage;
    if (SB.before) {
      const gen = contextFor('generic');
      stage = `<div class="sb-tags"><span class="sb-tag sb-tag-l">Before · a typical AI-built app</span><span class="sb-tag sb-tag-r">After · ${e(brand.name)} in ${e(brand.def.name)}</span></div>
        <div class="sb-compare" data-kind="${SB.kind}" style="--sb-x:${SB.split}%">
          <div class="sb-layer sb-layer-brand">${brandHtml}</div>
          <div class="sb-layer sb-layer-gen" aria-label="Generic version">${screens(gen, SB.kind)}</div>
          <div class="sb-handle" role="slider" tabindex="0" aria-label="Before and after divider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(SB.split)}" aria-valuetext="${Math.round(SB.split)}% generic">
            <span class="sb-grip" aria-hidden="true"></span>
          </div>
        </div>`;
    } else {
      stage = `<div class="sb-single" data-kind="${SB.kind}">${brandHtml}</div>`;
    }
    host.innerHTML = `${barHtml(brand.def)}${stage}
      <p class="sb-note">Every screen is drawn from the same colours, type and components as the board and the AI brief.${SB.before ? ' Drag the divider, or focus it and use the arrow keys.' : ''}</p>`;
    finish(host, brand.def);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitStatsSoon);
  }

  // The fix-ups every drawn screen gets once it is in the page (render and kitInto).
  function finish(host, def) {
    // Token-styled pieces (sidebar items, tabs, danger buttons) borrow the corner radius
    // and button lettering of the aesthetic's own CTA.
    host.querySelectorAll('.sb-ab').forEach(root => {
      const ref = root.querySelector('.ab-cta');
      if (!ref) return;
      const cs = getComputedStyle(ref);
      root.style.setProperty('--sb-r', cs.borderTopLeftRadius || '8px');
      root.style.setProperty('--sb-ui-ff', cs.fontFamily);
      root.style.setProperty('--sb-ui-tt', cs.textTransform);
      root.style.setProperty('--sb-ui-ls', cs.letterSpacing === 'normal' ? '0' : cs.letterSpacing);
      // sheets and callouts take the style's card corner
      const card = root.querySelector('.ab-card');
      if (card) root.style.setProperty('--sb-card-r', getComputedStyle(card).borderTopLeftRadius || '12px');
    });
    host.querySelectorAll('.sb-ab').forEach(kitColours);
    if (def.blend) {
      host.querySelectorAll('.sb-ab').forEach(root => {
        try {
          if (typeof blendClearArtText === 'function') blendClearArtText(root);
          if (typeof blendLegibility === 'function') blendLegibility(root);
        } catch (err) { /* a blend fix-up is cosmetic */ }
      });
    }
    kitLists(host);
    fitHeroShot(host);
    fitStats(host);
  }

  // SeeBuilt.kitInto(host, { mode }): the UI kit tab (cells, screen layouts, phone type, colour roles) for the
  // current state, drawn into `host` (an element already in the page), in `mode` ('light' | 'dark', default the
  // state's own) without changing the state, the Built view or its tab. Returns the kit page element or null.
  // The AI brief measures the kit this way (js/ai-brief.js aibKitMeasure).
  function kitInto(host, opts) {
    if (!host) return null;
    const mode = opts && (opts.mode === 'light' || opts.mode === 'dark') ? opts.mode : null;
    const st = mode && typeof state !== 'undefined' && state.bgMode !== mode ? Object.assign({}, state, { bgMode: mode }) : undefined;
    if (typeof setBoardFonts === 'function') setBoardFonts(host);
    Object.entries(kitVars()).forEach(([k, val]) => host.style.setProperty(k, val));
    const brand = contextFor('brand', st);
    host.innerHTML = `<div class="sb-single" data-kind="kit">${screens(brand, 'kit')}</div>`;
    finish(host, brand.def);
    return host.querySelector('.sb-ab .sb-kitpage');
  }

  // SeeBuilt.mobileInto(host, { mode }): the Mobile app tab's Welcome and Home phones for the current state,
  // drawn into `host` like kitInto (state, Built view and its tab untouched). Returns host.
  function mobileInto(host, opts) {
    if (!host) return null;
    const mode = opts && (opts.mode === 'light' || opts.mode === 'dark') ? opts.mode : null;
    const st = mode && typeof state !== 'undefined' && state.bgMode !== mode ? Object.assign({}, state, { bgMode: mode }) : undefined;
    if (typeof setBoardFonts === 'function') setBoardFonts(host);
    Object.entries(kitVars()).forEach(([k, val]) => host.style.setProperty(k, val));
    const brand = contextFor('brand', st);
    const before = SB.before;
    SB.before = false;   // both phones, as the Mobile tab shows them without the divider
    try { host.innerHTML = `<div class="sb-single" data-kind="mobile">${screens(brand, 'mobile')}</div>`; } finally { SB.before = before; }
    finish(host, brand.def);
    return host;
  }

  // Destructive and status colours come from the brand palette only (js/ui-kit.js uiKitDanger,
  // uiKitTone): destructive / error = the palette's reddish colour, or the ink (then the
  // destructive button is an outline with an ink label, data-sb-danger="ink"); callouts tint
  // info = primary, success = secondary, warning = accent, each icon shaded to 3:1 on the canvas.
  function kitColours(root) {
    if (typeof uiKitDanger !== 'function') return;
    const probe = document.createElement('i');
    probe.style.display = 'none';
    root.appendChild(probe);
    const read = v => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };
    const pal = { primary: read('--ab-primary'), secondary: read('--ab-secondary'), accent: read('--ab-accent'), ink: read('--ab-ink'), canvas: read('--ab-canvas') };
    probe.remove();
    const d = uiKitDanger(pal);
    const set = (k, v) => root.style.setProperty(k, v);
    // fill: a reddish palette colour distinct from the primary; line: it is the primary (an outline
    // in that colour, so destructive never looks like the main action); ink: no reddish colour
    root.dataset.sbDanger = d.role ? (d.fill ? 'fill' : 'line') : 'ink';
    set('--sb-danger', d.color); set('--sb-danger-text', d.text); set('--sb-danger-on', d.on);
    set('--sb-danger-line', `color-mix(in srgb, ${d.color} ${d.role ? 40 : 30}%, transparent)`);
    // icon and edge hold 3.2:1 on the callout's own tint (12% of the tone over the canvas)
    [['info', pal.primary], ['ok', pal.secondary], ['warn', pal.accent]].forEach(([k, c]) => {
      const t = uiKitTone(c, pal, 3.2, 0.12);
      set(`--k-${k}`, t.color); set(`--k-${k}-ico`, t.ico);
    });
    set('--k-err', d.color); set('--k-err-ico', d.role ? uiKitTone(d.color, pal, 3.2, 0.12).ico : d.text);
    // the primary as text (text buttons, tags, tinted icons): 4.5:1 on the canvas and on --ab-pri-tint
    set('--k-pri-text', uiKitTone(pal.primary, pal, 4.5).ico);
    set('--k-pri-on-tint', uiKitTone(pal.primary, { ink: pal.ink, canvas: read2(root, '--ab-pri-tint') || pal.canvas }, 4.5).ico);
    // fields drawn as an underline get a thicker underline on focus / error, never a box ring
    const inp = root.querySelector('.ab-input');
    if (inp) {
      const ic = getComputedStyle(inp);
      const line = parseFloat(ic.borderLeftWidth) === 0 && parseFloat(ic.borderBottomWidth) > 0 && ic.boxShadow === 'none';
      root.dataset.kField = line ? 'line' : 'box';
    }
  }
  function read2(root, v) {
    const probe = document.createElement('i');
    probe.style.display = 'none';
    probe.style.color = `var(${v})`;
    root.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return /rgba?\([^)]*,\s*0\)$/.test(c) ? '' : c;
  }

  // Grouped list rows sit 16pt in from their card. A list counts as a card when the list or its
  // rows draw a box (side edge, fill or shadow); an open list (rows and rules on the canvas) keeps
  // its text on the screen margin. In a card, the section label above takes the same inset and a
  // rule between rows starts at the text, not at the card edge.
  function kitLists(host) {
    const alpha = c => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (m) { const p = m[1].split(/[\s,\/]+/).filter(Boolean); return p.length > 3 ? +p[3] : 1; } const m2 = /color\([^)]*\/\s*([\d.]+)\)/.exec(c || ''); return m2 ? +m2[1] : (/color\(/.test(c || '') ? 1 : 0); };
    const edge = (cs, side) => parseFloat(cs[`border${side}Width`]) > 0 && cs[`border${side}Style`] !== 'none' && alpha(cs[`border${side}Color`]) > 0.05;
    const boxed = (cs, img) => edge(cs, 'Left') || edge(cs, 'Right') || alpha(cs.backgroundColor) > 0.03 || cs.boxShadow !== 'none' || (img && cs.backgroundImage !== 'none');
    // a box drawn by the list's ::before / ::after (a positioned plate behind the rows) counts too
    const pseudoBox = el => ['::before', '::after'].some(pe => { const c = getComputedStyle(el, pe); return c.content !== 'none' && c.position === 'absolute' && boxed(c, true); });
    host.querySelectorAll('.sb-kit .sb-k-list').forEach(list => {
      const rows = [...list.children].filter(r => r.classList.contains('sb-k-row'));
      if (!rows.length) return;
      const lcs = getComputedStyle(list);
      const rowBox = rows.some(r => boxed(getComputedStyle(r), false));
      // a style can say it outright: --k-list-box: card | open
      const said = lcs.getPropertyValue('--k-list-box').trim();
      const card = said === 'card' ? true : said === 'open' ? false : boxed(lcs, true) || rowBox || pseudoBox(list);
      list.classList.toggle('is-open', !card);
      if (!card) return;
      // the section label right above the list (in a screen layout it sits in the block before)
      const blk = list.parentElement && list.parentElement.classList.contains('sb-k-blk') ? list.parentElement : null;
      const prev = blk ? blk.previousElementSibling : list.previousElementSibling;
      const sec = prev && (prev.classList.contains('sb-k-section') ? prev : prev.querySelector(':scope > .sb-k-section'));
      if (sec) { sec.classList.add('is-inset'); sec.style.setProperty('--k-inset', (16 + parseFloat(lcs.borderLeftWidth || 0)) + 'px'); }
      if (rowBox) return;   // each row is its own box: no shared rules to inset
      rows.forEach((r, i) => {
        const cs = getComputedStyle(r);
        if (getComputedStyle(r, '::after').content !== 'none') return;
        const side = i > 0 && edge(cs, 'Top') ? 'Top' : i < rows.length - 1 && edge(cs, 'Bottom') ? 'Bottom' : '';
        if (!side) return;
        // from computed sizes, not layout: phones are scaled and the view may be hidden
        const lead = r.querySelector(':scope > .sb-k-lead > *');
        const x = parseFloat(cs.paddingLeft) + (lead ? (parseFloat(getComputedStyle(lead).width) || 32) + (parseFloat(cs.columnGap) || 14) : 0);
        const w = cs[`border${side}Width`], line = `${w} ${cs[`border${side}Style`]} ${cs[`border${side}Color`]}`;   // read before the class hides it (cs is live)
        r.style.setProperty('--k-dv-x', Math.round(x) + 'px');
        r.style.setProperty('--k-dv-w', w);
        r.style.setProperty('--k-dv', line);
        r.classList.add('sb-k-dv', 'sb-k-dv-' + side.toLowerCase());
      });
    });
  }

  // The landing hero phone takes the grid slot the aesthetic gives its hero art (read from a
  // throwaway .ab-art probe, removed at once, so no art is ever drawn), then scales to the
  // column it gets (0.42 to 0.56).
  function fitHeroShot(host) {
    host.querySelectorAll('.sb-lhero-shot').forEach(shot => {
      const probe = document.createElement('div');
      probe.className = 'ab-art';
      probe.style.display = 'none';
      shot.parentElement.insertBefore(probe, shot);
      const pcs = getComputedStyle(probe);
      ['gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd', 'alignSelf', 'justifySelf', 'order'].forEach(k => {
        const v = pcs[k];
        if (v && v !== 'auto' && v !== 'normal' && v !== '0') shot.style[k] = v;
      });
      probe.remove();
      // art drawn as a layer under the copy (same grid cell) is no slot for a phone: back to flow
      const hl = shot.parentElement.querySelector('.ab-headline'), a = shot.getBoundingClientRect(), b = hl && hl.getBoundingClientRect();
      if (b && b.width && a.width && !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom)) {
        ['gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd'].forEach(k => { shot.style[k] = 'auto'; });
        ['alignSelf', 'justifySelf', 'order'].forEach(k => { shot.style[k] = ''; });
      }
      const cs = getComputedStyle(shot);
      const w = shot.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (w > 0) shot.style.setProperty('--sb-phone-scale', Math.max(0.42, Math.min(0.56, w / 414)).toFixed(3));
    });
  }

  // A phone list ends on a whole row above the tab bar: rows that would run past the
  // list's own box are left out instead of being cut mid-row.
  function fitPhoneLists(host) {
    host.querySelectorAll('.sb-home-list, .sb-k-fill').forEach(sec => {
      const rows = [...sec.querySelectorAll('.sb-k-row')];
      rows.forEach(r => r.classList.remove('sb-k-cut'));
      const box = sec.getBoundingClientRect();
      if (!box.height) return;
      const scale = sec.offsetHeight ? box.height / sec.offsetHeight : 1;
      rows.forEach(r => {
        const rb = r.getBoundingClientRect();
        if ((rb.bottom - box.top) / scale > sec.clientHeight + 0.5) r.classList.add('sb-k-cut');
      });
    });
  }

  // Stat values (and the chart total) never truncate: each one is scaled down until it
  // fits its card, in whatever case, tracking and face the aesthetic gives it.
  function fitStats(host) {
    fitPhoneLists(host);
    host.querySelectorAll('.sb-num').forEach(el => {
      el.style.removeProperty('font-size');
      if (!el.clientWidth) return;
      let px = parseFloat(getComputedStyle(el).fontSize) || 24;
      for (let i = 0; i < 24 && el.scrollWidth > el.clientWidth + 0.5 && px > 10; i++) {
        px = Math.max(10, px * 0.94);
        el.style.setProperty('font-size', px.toFixed(2) + 'px', 'important');
      }
    });
  }
  let fitQueued = false;
  function fitStatsSoon() {
    const host = document.getElementById('builtView');
    if (!host || fitQueued) return;
    fitQueued = true;
    const run = () => { if (!fitQueued) return; fitQueued = false; fitStats(host); };
    requestAnimationFrame(run);
    setTimeout(run, 150);   // a hidden or throttled window may never fire the frame
  }

  /* ---------------- interactions ---------------- */

  function redrawChart(card, range) {
    const root = card.closest('.ab, .sb-gen');
    const X = { name: effectiveContent().brandName };
    const base = Number(card.dataset.base) || 100;
    const unit = card.dataset.unit || '';
    const s = seriesFor(X.name, range, base);
    card.querySelector('[data-sb-plot]').innerHTML = chartSvg(s);
    card.querySelector('[data-sb-x]').innerHTML = xLabels(s.labels);
    card.querySelector('[data-sb-total]').textContent = fmt(s.now.reduce((a, b) => a + b, 0), unit);
    card.querySelector('[data-sb-readout]').textContent = `${s.labels[s.labels.length - 1]} · ${fmt(s.now[s.now.length - 1], unit)}`;
    card.dataset.range = range;
    if (root) root.dataset.range = range;
    fitStatsSoon();
  }

  function chartHover(card, clientX) {
    const plot = card.querySelector('[data-sb-plot]');
    const r = plot.getBoundingClientRect();
    if (!r.width) return;
    const range = card.dataset.range || '30d';
    const s = seriesFor(effectiveContent().brandName, range, Number(card.dataset.base) || 100);
    const g = chartGeom(s);
    const n = g.pts.length;
    const i = Math.max(0, Math.min(n - 1, Math.round(((clientX - r.left) / r.width) * (n - 1))));
    const [x, y] = g.pts[i];
    const cur = plot.querySelector('.sb-c-cursor');
    if (cur) { cur.setAttribute('x1', x); cur.setAttribute('x2', x); }
    const dot = plot.querySelector('.sb-c-dot');
    if (dot) { dot.style.left = `${(x / CW) * 100}%`; dot.style.top = `${(y / CH) * 100}%`; }
    card.querySelector('[data-sb-readout]').textContent = `${s.labels[i]} · ${fmt(s.now[i], card.dataset.unit || '')}`;
  }

  function setSplit(pct, host) {
    SB.split = Math.max(0, Math.min(100, pct));
    const cmp = host.querySelector('.sb-compare');
    if (!cmp) return;
    cmp.style.setProperty('--sb-x', SB.split + '%');
    const h = cmp.querySelector('.sb-handle');
    if (h) {
      h.setAttribute('aria-valuenow', String(Math.round(SB.split)));
      h.setAttribute('aria-valuetext', `${Math.round(SB.split)}% generic`);
    }
  }

  function wire(host) {
    host.addEventListener('click', ev => {
      const t = ev.target;
      const kind = t.closest('.sb-kind');
      if (kind) { setKind(kind.dataset.kind); return; }
      if (t.closest('.sb-ba-btn')) { setBefore(!SB.before); return; }
      if (t.closest('[data-sb-nolink]')) { ev.preventDefault(); return; }
      const segBtn = t.closest('.ab-seg-btn');
      if (segBtn) {
        const group = segBtn.closest('.ab-seg');
        group.querySelectorAll('.ab-seg-btn').forEach(b => b.setAttribute('aria-pressed', String(b === segBtn)));
        const kindOf = group.dataset.sb;
        if (kindOf === 'range') redrawChart(group.closest('[data-sb-chart]'), segBtn.dataset.v);
        if (kindOf === 'billing') {
          const yearly = segBtn.dataset.v === 'y';
          group.closest('.sb-pricing').querySelectorAll('[data-sb-price]').forEach(p => { p.textContent = yearly ? p.dataset.y : p.dataset.m; });
        }
        return;
      }
      const nav = t.closest('.sb-navi');
      if (nav) {
        nav.parentElement.querySelectorAll('.sb-navi').forEach(b => { if (b === nav) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
        const title = nav.closest('.sb-app') && nav.closest('.sb-app').querySelector('[data-sb-title]');
        if (title) title.textContent = nav.dataset.title;
        return;
      }
      const ktab = t.closest('.sb-k-tabs [role="tab"]');
      if (ktab) {
        ktab.parentElement.querySelectorAll('[role="tab"]').forEach(b => b.setAttribute('aria-selected', String(b === ktab)));
        return;
      }
      const tab = t.closest('.sb-tab');
      if (tab) {
        tab.parentElement.querySelectorAll('.sb-tab').forEach(b => { if (b === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
        return;
      }
      const btn = t.closest('.ab-cta[data-done]');
      if (btn) {
        const label = btn.querySelector('.ab-cta-label');
        const done = label.textContent === btn.dataset.done;
        label.textContent = done ? btn.dataset.label : btn.dataset.done;
        btn.classList.toggle('is-done', !done);
        return;
      }
      const danger = t.closest('.sb-danger-btn');
      if (danger) {
        const box = danger.closest('.sb-danger-box');
        const note = box.querySelector('.sb-danger-note');
        if (danger.dataset.armed) {
          delete danger.dataset.armed;
          danger.textContent = danger.dataset.sbDanger === 'delete' ? 'Delete workspace' : 'Pause';
          note.textContent = 'Nothing was changed. This is a preview of the settings page.';
        } else {
          box.querySelectorAll('.sb-danger-btn[data-armed]').forEach(b => { delete b.dataset.armed; b.textContent = b.dataset.sbDanger === 'delete' ? 'Delete workspace' : 'Pause'; });
          danger.dataset.armed = '1';
          danger.textContent = 'Click again to confirm';
          note.textContent = '';
        }
        return;
      }
      const row = t.closest('.ab-row');
      if (row && row.closest('.sb-ab, .sb-gen')) {
        const was = row.classList.contains('is-picked');
        row.parentElement.querySelectorAll('.ab-row.is-picked').forEach(r => r.classList.remove('is-picked'));
        row.classList.toggle('is-picked', !was);
      }
    });
    host.addEventListener('keydown', ev => {
      const row = ev.target.closest && ev.target.closest('.ab-row[tabindex]');
      if (row && (ev.key === 'Enter' || ev.key === ' ')) {
        ev.preventDefault();
        ev.stopPropagation();
        row.click();
        return;
      }
      const h = ev.target.closest && ev.target.closest('.sb-handle');
      if (!h) return;
      const step = ev.shiftKey ? 10 : 2;
      let next = null;
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') next = SB.split - step;
      else if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') next = SB.split + step;
      else if (ev.key === 'Home') next = 0;
      else if (ev.key === 'End') next = 100;
      else if (ev.key === 'PageDown') next = SB.split - 10;
      else if (ev.key === 'PageUp') next = SB.split + 10;
      if (next == null) return;
      ev.preventDefault();
      ev.stopPropagation();
      setSplit(next, host);
    });
    host.addEventListener('input', ev => {
      const r = ev.target;
      if (!r.classList || !r.classList.contains('sb-k-range')) return;
      r.style.setProperty('--v', r.value + '%');
      const out = r.parentElement.querySelector('[data-sb-range-out]');
      if (out) out.textContent = r.value + '%';
    });
    host.addEventListener('change', ev => {
      const sw = ev.target;
      if (!sw.classList || !sw.classList.contains('ab-switch')) return;
      const panel = sw.closest('.ab-panel');
      const status = panel && panel.querySelector('.ab-status');
      if (!status) return;
      const all = panel.querySelectorAll('.ab-switch');
      const on = [...all].filter(x => x.checked).length;
      status.textContent = panel.closest('.sb-set') ? `${on} of ${all.length} on` : `Saved · ${sw.closest('.ab-toggle').textContent.trim()} ${sw.checked ? 'on' : 'off'}`;
    });
    // Dragging the divider (pointer capture on the handle; a press on the line works too).
    let drag = null;
    host.addEventListener('pointerdown', ev => {
      const h = ev.target.closest('.sb-handle');
      if (!h) return;
      const cmp = h.closest('.sb-compare');
      drag = { cmp, id: ev.pointerId };
      h.setPointerCapture(ev.pointerId);
      h.focus({ preventScroll: true });
      ev.preventDefault();
    });
    host.addEventListener('pointermove', ev => {
      if (drag && ev.pointerId === drag.id) {
        const r = drag.cmp.getBoundingClientRect();
        setSplit(((ev.clientX - r.left) / r.width) * 100, host);
        return;
      }
      const card = ev.target.closest && ev.target.closest('[data-sb-chart]');
      if (card && ev.target.closest('[data-sb-plot]')) chartHover(card, ev.clientX);
    });
    const end = ev => { if (drag && ev.pointerId === drag.id) drag = null; };
    host.addEventListener('pointerup', end);
    host.addEventListener('pointercancel', end);
  }

  /* ---------------- public ---------------- */

  function setKind(kind) {
    if (!KINDS.some(k => k[0] === kind)) return;
    SB.kind = kind;
    render();
  }
  function setBefore(on) {
    SB.before = !!on;
    render();
  }

  function openBuilt() {
    if (typeof setBoardView === 'function') setBoardView('built');
  }

  function init() {
    const host = document.getElementById('builtView');
    if (host) wire(host);
    if (host && window.ResizeObserver) new ResizeObserver(fitStatsSoon).observe(host);
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fitStatsSoon);   // a face that arrives late changes the widths
    // Esc leaves the Built view for the board (the demo loop sends it between beats), unless
    // a dialog or the brief tray has the keyboard.
    document.addEventListener('keydown', ev => {
      if (ev.key !== 'Escape' || ev.defaultPrevented) return;
      if (typeof boardView === 'undefined' || boardView !== 'built') return;
      const b = document.body;
      if (b.classList.contains('has-dialog') || b.classList.contains('has-cart')) return;
      const open = [...document.querySelectorAll('dialog[open], [role="dialog"][aria-modal="true"]')].some(d => d.getClientRects().length > 0);
      if (open) return;
      if (typeof setBoardView === 'function') setBoardView('board');
    });
  }

  window.SeeBuilt = { render, kitInto, mobileInto, kinds: KINDS.map(k => k[0]), domainFor };
  window.Show = window.Show || {};
  // Show.built(kind): open the Built view, optionally at 'kit' | 'dashboard' | 'mobile' | 'landing' | 'settings'.
  window.Show.built = function (kind) {
    if (kind && KINDS.some(k => k[0] === kind)) SB.kind = kind;
    if (typeof boardView !== 'undefined' && boardView === 'built') render();
    else openBuilt();
  };
  // Show.beforeAfter(on): turn the before / after divider on (default) or off, opening the Built view.
  window.Show.beforeAfter = function (on) {
    SB.before = on !== false;
    if (typeof on === 'number') SB.split = Math.max(0, Math.min(100, on));
    if (typeof boardView !== 'undefined' && boardView === 'built') render();
    else openBuilt();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
