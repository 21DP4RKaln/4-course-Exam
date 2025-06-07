import fetch from 'node-fetch';

/**
 * Reset product view counts across all product types
 */
async function resetViewCounts() {
  try {
    const apiKey = process.env.RESET_VIEWS_API_KEY;

    if (!apiKey) {
      console.error(
        'API key is missing. Set RESET_VIEWS_API_KEY environment variable.'
      );
      process.exit(1);
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const response = await fetch(
      `${baseUrl}/api/shop/product/view?apiKey=${apiKey}`,
      {
        method: 'PUT',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      const errorMessage =
        (error as { error?: string }).error || 'Unknown error';
      throw new Error(`Failed to reset view counts: ${errorMessage}`);
    }

    const result = (await response.json()) as { resetCounts: number };
    console.log('Successfully reset view counts:', result.resetCounts);
  } catch (error) {
    console.error('Error resetting view counts:', error);
    process.exit(1);
  }
}

resetViewCounts();

// package.json script addition:
// "scripts": {
//   ...
//   "reset-views": "tsx scripts/reset-view-counts.ts"
// }

// Example crontab entry to run this script on the 1st of each month at 00:00
// 0 0 1 * * /usr/bin/node /path/to/your/project/scripts/reset-view-counts.js >> /path/to/logs/reset-views.log 2>&1
