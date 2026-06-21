## 2026-06-18T17:39:29Z

You are the Milestone 2 Explorer. Your mission is to explore and plan the implementation of the core shared components (Header, Footer, and Pricing) under E:\Youtube\Ban Content\Web\components\ and their integration in E:\Youtube\Ban Content\Web\app\page.tsx.

Please do the following:
1. Analyze the project layout and code under E:\Youtube\Ban Content\Web.
2. Read the selector contracts and E2E test cases in g:\My Drive\Youtube\Automation (AG)\Ban content\TEST_INFRA.md and E:\Youtube\Ban Content\Web\e2e\app.spec.ts.
3. Propose the exact file contents and design for:
   - components/Header.tsx: Brand logo "Ban Content", Home, Features, Pricing, and Dashboard links, responsive mobile menu toggle and responsive dropdown/drawer, proper selector contracts (data-testid="header", "brand-logo", "nav-link-home", "nav-link-features", "nav-link-pricing", "nav-link-hub", "menu-toggle-btn").
   - components/Footer.tsx: Simple styling, copyright text, selector contracts (data-testid="footer", "footer-copyright").
   - components/Pricing.tsx: Interactive monthly/yearly toggle. Monthly/yearly price states for Free, VIP, Ultimate plans. Choice CTA links dynamically formatting to `/hub?plan=<free|vip|ultimate>&billing=<monthly|yearly>`. Selector contracts (data-testid="pricing-section", "pricing-toggle", card elements, price values, select buttons, pricing-vip-badge).
4. Propose how these components will be integrated in E:\Youtube\Ban Content\Web\app\page.tsx (ensure no compile issues, proper layout structure, bg-zinc-950 background, etc.).
5. Write your findings and proposed code in handoff.md in your working directory E:\Youtube\Ban Content\Web\.agents\explorer_components\.

Do NOT modify any code files yourself. Return a handoff detailing the exact code changes to be made.
