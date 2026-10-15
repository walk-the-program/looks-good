/* ---------------------------------------------------------------------
   see-built.js — the "Built" board view.

   Renders the current brand (abView(): aesthetic, blend, classic version,
   pure ground, fonts, colours, logo) as realistic, clickable product screens:
   a SaaS dashboard, a mobile app (onboarding + home), a landing page and a
   settings page. Every branded screen sits in the board's own
   `.ab[data-ae]` root (abBoardParts(...).rootOpen) and uses the board's
   component classes (.ab-card, .ab-panel, .ab-seg, .ab-cta, .ab-input,
   .ab-toggle/.ab-switch, .ab-list/.ab-row, .ab-art, .ab-headline ...), so
   each aesthetic's own CSS styles it. Layout lives in css/see-built.css.

   Before / after: the same screen drawn as a generic AI-built app (system
   font, indigo button, white cards) under a draggable divider.

   Entry points: Show.built(kind), Show.beforeAfter(on), SeeBuilt.render().
   Deterministic templates only. Plain <script>, no modules.
------------------------------------------------------------------------ */

(function () {
  const KINDS = [
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
      rows: [['Harbor Street Café', 'Packing', 72], ['Elm & Rye Bakery', 'Picking', 45], ['The Larder Co-op', 'Out for delivery', 90], ['Marigold Kitchen', 'Confirmed', 15]],
      panel: { title: 'Delivery', field: ['Order cut-off', '4:00 pm'], toggles: [['Auto-confirm orders', true], ['Text customers on dispatch', false]] },
      mobile: {
        welcome: 'From small farms to your door',
        body: 'Choose a weekly box, skip a week any time, and see where every item was grown.',
        hello: 'Your next box', card: ['Arrives Thursday', 'Seasonal vegetable box · 9 items'],
        cta: ['Edit this box', 'Box updated'], seg: ['This week', 'Next week'],
        listTitle: 'In your box',
        rows: [['Heirloom tomatoes', 'Picked', 100], ['Sourdough loaf', 'Baking', 60], ['Free-range eggs', 'Packed', 100]],
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
      rows: [['Checkout redesign', 'In review', 72], ['Mobile sync', 'Building', 45], ['Billing API v2', 'Testing', 88], ['Onboarding emails', 'Planned', 10]],
      panel: { title: 'Release', field: ['Release name', 'Spring 2.4'], toggles: [['Deploy on merge', true], ['Require a reviewer', true]] },
      mobile: {
        welcome: 'Your whole team, one place',
        body: 'Track every project, review changes and ship from wherever you are.',
        hello: 'Good morning', card: ['3 reviews waiting', 'Checkout redesign needs a second look.'],
        cta: ['Start review', 'Review started'], seg: ['Assigned', 'Following'],
        listTitle: 'Today',
        rows: [['Checkout redesign', 'Review', 72], ['Billing API v2', 'Testing', 88], ['Mobile sync', 'Building', 45]],
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
      rows: [['Morning strength', 'Full', 100], ['Mobility basics', 'Open', 60], ['Sleep reset', 'Starting soon', 25], ['Breathwork', 'Open', 45]],
      panel: { title: 'Bookings', field: ['Cancellation window', '12 hours'], toggles: [['Allow waitlist', true], ['Send day-before reminders', true]] },
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
      rows: [['Waxed field jacket', 'In transit', 72], ['Linen overshirt', 'Ordered', 35], ['Canvas tote', 'Received', 100], ['Wool beanie', 'Planned', 10]],
      panel: { title: 'Store', field: ['Free shipping over', '$75'], toggles: [['Show low stock badges', true], ['Allow pre-orders', false]] },
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
      rows: [['Brand refresh', 'Review', 72], ['Customer interviews', 'Writing', 88], ['Spring campaign', 'Planning', 10]],
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
  };
  const icon = (k, size = 18) => `<svg class="sb-ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICO[k] || ''}</svg>`;
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

  function art(X, cls = '') {
    if (X.mode === 'brand') return `<div class="ab-art ${cls}" aria-hidden="true">${X.P.art()}</div>`;
    return `<div class="ab-art sb-gen-art ${cls}" aria-hidden="true"><i></i><i></i><i></i><i></i></div>`;
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
    const stats = D.stats.map(([label, value, delta, good]) => `<div class="ab-card sb-stat">
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
          <div class="ab-card sb-chart" data-sb-chart data-base="${D.chart[2]}" data-unit="${e(D.chart[1])}">
            <div class="sb-chart-head">
              <div><p class="ab-label">${e(D.chart[0])}</p><p class="ab-card-title sb-num sb-chart-total" data-sb-total>${e(fmt(total, D.chart[1]))}</p><p class="ab-card-body sb-readout" data-sb-readout>${e(series.labels[series.labels.length - 1])} · ${e(fmt(series.now[series.now.length - 1], D.chart[1]))}</p></div>
              ${seg([['7d', '7 days'], ['30d', '30 days'], ['12m', '12 months']], 1, 'range', 'Chart range')}
            </div>
            <div class="sb-chart-plot" data-sb-plot>${chartSvg(series)}</div>
            <div class="sb-chart-x" data-sb-x>${xLabels(series.labels)}</div>
            <p class="sb-legend"><span class="sb-lg-now"></span>This period<span class="sb-lg-prev"></span>Previous period</p>
          </div>
          <div class="ab-panel sb-quick">
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

  function statusBar() {
    return `<div class="sb-statusbar" aria-hidden="true"><span>9:41</span><span class="sb-sb-r"><i class="sb-sig"></i><i class="sb-wifi"></i><i class="sb-bat"></i></span></div>`;
  }

  function mobileOnboard(X) {
    const M = X.D.mobile;
    return `<div class="sb-phone-in sb-onboard">
        ${statusBar()}
        <div class="sb-ob-top"><div class="ab-brand">${brandMark(X)}</div><button type="button" class="sb-link">Skip</button></div>
        <div class="sb-ob-art">${art(X, 'sb-ob-artbox')}</div>
        <div class="sb-ob-copy">
          <p class="ab-kicker">Welcome</p>
          ${headline(X, M.welcome, ' sb-ob-h')}
          <p class="ab-subcopy sb-ob-body">${e(M.body)}</p>
        </div>
        <div class="sb-dots" aria-hidden="true"><i class="is-on"></i><i></i><i></i></div>
        <div class="sb-ob-actions">
          ${cta('Get started', 'Setting things up')}
          <button type="button" class="ab-type-apply sb-wide">I have an account</button>
        </div>
        <div class="sb-homebar" aria-hidden="true"></div>
      </div>`;
  }

  function mobileHome(X) {
    const M = X.D.mobile;
    return `<div class="sb-phone-in sb-home">
        ${statusBar()}
        <div class="sb-home-top">
          <div><p class="ab-kicker">${e(M.hello)}</p><h2 class="ab-card-title sb-home-h">Hi, ${e(X.me.split(' ')[0])}</h2></div>
          <button type="button" class="ab-type-apply sb-icon-btn" aria-label="Notifications">${icon('bell', 17)}<i class="sb-badge" aria-hidden="true"></i></button>
        </div>
        <div class="ab-card sb-home-card">
          ${seg(M.seg.map((s, i) => [String(i), s]), 0, 'mseg', 'Show')}
          <h3 class="ab-card-title">${e(M.card[0])}</h3>
          <p class="ab-card-body">${e(M.card[1])}</p>
          ${cta(M.cta[0], M.cta[1])}
        </div>
        <section class="sb-home-list" aria-label="${e(M.listTitle)}">
          ${labelRow(num(1, M.listTitle), '')}
          ${rowsHtml(M.rows)}
        </section>
        <nav class="sb-tabs" aria-label="App">${M.tabs.map((t, i) =>
          `<button type="button" class="sb-tab"${i === 0 ? ' aria-current="page"' : ''}>${icon(TAB_ICONS[i], 20)}<span>${e(t)}</span></button>`).join('')}</nav>
        <div class="sb-homebar" aria-hidden="true"></div>
      </div>`;
  }

  /* ---------------- 3. landing page ---------------- */

  function landing(X) {
    const L = X.D.landing;
    const plans = L.plans.map(([name, price, blurb, perks], i) => {
      const featured = i === 1;
      const priceTxt = (yearly) => {
        if (L.per === 'from') return `<span class="sb-from">from</span> ${money(price)}`;
        if (!price) return '$0';
        return money(yearly ? Math.round(price * 0.8) : price);
      };
      return `<div class="ab-card sb-plan${featured ? ' is-featured' : ''}">
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
        ${art(X)}
      </section>
      <div class="ab-rule"></div>
      <section class="sb-features" aria-label="Features">
        ${labelRow(num(1, 'Why ' + X.name), '')}
        <div class="sb-feat-grid">${L.features.map(([t, b], i) => `<div class="ab-card sb-feat">
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
            <div class="ab-panel sb-set-panel">
              ${field(X, 'Workspace name', X.name)}
              <div class="sb-field-row">${field(X, 'Website', slug + '.com')}${field(X, 'Support email', 'hello@' + slug + '.com')}</div>
              ${field(X, 'Tagline', X.tagline)}
            </div>
          </section>
          <section class="sb-set-sec" aria-label="Notifications">
            <div class="sb-set-intro">${labelRow(num(2, 'Notifications'), '')}<p class="ab-card-body">Choose what is worth interrupting you for.</p></div>
            <div class="ab-panel sb-set-panel">
              ${D.notify.map(([l, h, on]) => toggle(X, l, on, h)).join('')}
              <div class="ab-status" aria-live="polite">${D.notify.filter(n => n[2]).length} of ${D.notify.length} on</div>
            </div>
          </section>
          <section class="sb-set-sec" aria-label="Appearance">
            <div class="sb-set-intro">${labelRow(num(3, 'Appearance'), '')}<p class="ab-card-body">Applies to everyone in the workspace.</p></div>
            <div class="ab-panel sb-set-panel">
              <p class="ab-fieldlabel">Theme</p>
              ${seg([['light', 'Light'], ['dark', 'Dark'], ['auto', 'Automatic']], 2, 'theme', 'Theme')}
              <p class="ab-fieldlabel sb-gap">Density</p>
              ${seg([['c', 'Comfortable'], ['k', 'Compact']], 0, 'density', 'Density')}
            </div>
          </section>
          <section class="sb-set-sec" aria-label="Plan">
            <div class="sb-set-intro">${labelRow(num(4, 'Plan'), '')}<p class="ab-card-body">Billed monthly. Change or cancel any time.</p></div>
            <div class="ab-card sb-planbox">
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

  /* ---------------- assembly ---------------- */

  const BUILDERS = { dashboard, landing, settings };

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
      const phone = (body, cap) => `<figure class="sb-phone"><div class="sb-phone-frame"><span class="sb-island" aria-hidden="true"></span>${open('sb-screen')}${body}</section></div><figcaption>${cap}</figcaption></figure>`;
      // Under the before / after divider a pair of phones would put a different screen on each
      // side, so the comparison shows one phone (the home screen) split down the middle.
      if (SB.before) return `<div class="sb-phones">${phone(mobileHome(X), 'Home')}</div>`;
      return `<div class="sb-phones">${phone(mobileOnboard(X), 'Welcome')}${phone(mobileHome(X), 'Home')}</div>`;
    }
    return `${open('sb-window')}${BUILDERS[kind](X)}</section>`;
  }

  function contextFor(mode) {
    const v = abView();
    const P = abBoardParts(v.state, v.def);
    const copy = P.copy;
    const D = domainFor(copy);
    const people = ['Maya Ortiz', 'Sam Okafor', 'Lena Fischer', 'Jonah Reyes', 'Priya Nair', 'Theo Laurent'];
    const me = people[hashStr(copy.brandName) % people.length];
    return {
      mode, v, P, def: v.def, ctx: P.ctx, D,
      name: copy.brandName, tagline: copy.tagline, logo: v.state.logoDataUrl,
      me, role: 'Owner', uid: `sb${++seq}${mode[0]}`,
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

  function render() {
    const host = document.getElementById('builtView');
    if (!host) return;
    if (typeof setBoardFonts === 'function') setBoardFonts(host);
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
    });
    if (brand.def.blend) {
      host.querySelectorAll('.sb-ab').forEach(root => {
        try {
          if (typeof blendClearArtText === 'function') blendClearArtText(root);
          if (typeof blendLegibility === 'function') blendLegibility(root);
        } catch (err) { /* a blend fix-up is cosmetic */ }
      });
    }
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

  window.SeeBuilt = { render, kinds: KINDS.map(k => k[0]), domainFor };
  window.Show = window.Show || {};
  // Show.built(kind): open the Built view, optionally at 'dashboard' | 'mobile' | 'landing' | 'settings'.
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
