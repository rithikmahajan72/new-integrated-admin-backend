const cron = require('node-cron');
const { publishScheduledItems } = require('../controllers/itemController/ItemController');

/**
 * Scheduler for auto-publishing scheduled items
 * Runs every minute to check for items that should be published
 */
class ItemScheduler {
  constructor() {
    this.isRunning = false;
    this.task = null;
  }

  start() {
    if (this.isRunning) {
      console.log('📅 ItemScheduler is already running');
      return;
    }

    // Run every minute (adjust as needed)
    this.task = cron.schedule('* * * * *', async () => {
      console.log('📅 ItemScheduler: Running scheduled item check...');
      try {
        const result = await publishScheduledItems();
        if (result.publishedCount > 0) {
          console.log(`📅 ItemScheduler: Published ${result.publishedCount} items`);
        }
      } catch (error) {
        console.error('📅 ItemScheduler error:', error);
      }
    }, {
      scheduled: true,
      timezone: "UTC" // Adjust timezone as needed
    });

    this.isRunning = true;
    console.log('📅 ItemScheduler started - checking for scheduled items every minute');
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.isRunning = false;
      console.log('📅 ItemScheduler stopped');
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.task ? 'Every minute' : 'Not scheduled'
    };
  }
}

// Create singleton instance
const itemScheduler = new ItemScheduler();

module.exports = itemScheduler;
