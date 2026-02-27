import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1200, 'height': 2400})
        await page.goto('http://127.0.0.1:3000')
        await page.wait_for_selector('input')
        await page.fill('input', 'INV-BD-1')
        await page.click('button')
        # Wait for the analytics card to be completely mounted
        await page.wait_for_timeout(4000)
        await page.screenshot(path='C:/Users/nikki/.gemini/antigravity/brain/a74e511d-a16a-45fa-9f1e-231feab1eb08/dashboard_final.png', full_page=True)
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
