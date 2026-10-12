import asyncio, sys
from playwright.async_api import async_playwright
svg, png, pdf = sys.argv[1], sys.argv[2], sys.argv[3]
async def main():
    s=open(svg).read()
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':1000,'height':1000}, device_scale_factor=3)
        await pg.set_content(f'<html><body style="margin:0;background:transparent">{s}</body></html>')
        await pg.wait_for_timeout(300)
        await pg.locator('svg').screenshot(path=png, omit_background=True)
        # print-ready PDF: 100 mm coaster
        await pg.set_content(f'<html><head><style>@page{{size:100mm 100mm;margin:0}}body{{margin:0}}svg{{width:100mm;height:100mm;display:block}}.glaze{{display:none}}</style></head><body>{s}</body></html>')
        await pg.pdf(path=pdf, width='100mm', height='100mm', print_background=True)
        await b.close()
asyncio.run(main())
