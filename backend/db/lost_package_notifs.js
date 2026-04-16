// lost_package_notifs.js

/**
 * Ensure Lost_Status column exists; create it if missing
 */
async function ensureLostStatusColumn(pool) {
  try {
    await pool.query(
      `ALTER TABLE package 
       ADD COLUMN Lost_Status ENUM('active', 'lost', 'notified') DEFAULT 'active' AFTER Status_Code`
    );
    console.log('✅ Lost_Status column added to package table');
  } catch (err) {
    // Column likely already exists
    if (!err.message.includes('Duplicate column')) {
      console.warn('⚠️ Lost_Status column check/create failed:', err.message);
    }
  }
  
  try {
    await pool.query(
      `CREATE INDEX idx_lost_status ON package (Lost_Status, Recipient_ID)`
    );
  } catch (err) {
    // Index might already exist
    if (!err.message.includes('Duplicate key')) {
      console.warn('⚠️ Index creation warning:', err.message);
    }
  }
}

async function getLostPackagesByCustomer(pool, customerId) {
  // Primary: use Lost_Status column (exists if migration ran)
  try {
    const [rows] = await pool.query(
      `SELECT
          pkg.Tracking_Number,
          COALESCE(d.Delivery_Status_Code, pkg.Status_Code) AS Delivery_Status_Code,
          COALESCE(d.Date_Updated, pkg.Date_Updated) AS Date_Updated,
          COALESCE(d.Date_Created, pkg.Date_Created) AS Date_Created
      FROM package pkg
      LEFT JOIN delivery d ON d.Tracking_Number = pkg.Tracking_Number
      WHERE pkg.Recipient_ID = ?
        AND pkg.Lost_Status = 'lost';`,
      [customerId]
    );
    if (rows.length > 0) return rows;

    // Also catch packages marked lost by delivery status but before Lost_Status was set
    const [fallbackRows] = await pool.query(
      `SELECT
          pkg.Tracking_Number,
          COALESCE(d.Delivery_Status_Code, pkg.Status_Code) AS Delivery_Status_Code,
          COALESCE(d.Date_Updated, pkg.Date_Updated) AS Date_Updated,
          COALESCE(d.Date_Created, pkg.Date_Created) AS Date_Created
      FROM package pkg
      LEFT JOIN delivery d ON d.Tracking_Number = pkg.Tracking_Number
      WHERE pkg.Recipient_ID = ?
        AND COALESCE(d.Delivery_Status_Code, pkg.Status_Code) = 7
        AND (pkg.Lost_Status IS NULL OR pkg.Lost_Status != 'notified');`,
      [customerId]
    );
    return fallbackRows;
  } catch (err) {
    // Lost_Status column may not exist — fall back to delivery status only
    try {
      const [rows] = await pool.query(
        `SELECT
            pkg.Tracking_Number,
            COALESCE(d.Delivery_Status_Code, pkg.Status_Code) AS Delivery_Status_Code,
            COALESCE(d.Date_Updated, pkg.Date_Updated) AS Date_Updated,
            COALESCE(d.Date_Created, pkg.Date_Created) AS Date_Created
        FROM package pkg
        LEFT JOIN delivery d ON d.Tracking_Number = pkg.Tracking_Number
        WHERE pkg.Recipient_ID = ?
          AND COALESCE(d.Delivery_Status_Code, pkg.Status_Code) = 7;`,
        [customerId]
      );
      return rows;
    } catch (err2) {
      console.error('Error fetching lost packages:', err2.message);
      return [];
    }
  }
}

async function dismissLostPackage(pool, trackingNumber) {
  try {
    const [result] = await pool.query(
      `UPDATE package
       SET Lost_Status = 'notified'
       WHERE Tracking_Number = ?
         AND Lost_Status = 'lost'`,
      [trackingNumber]
    );
    return result;
  } catch (err) {
    console.error('Error dismissing lost package:', err.message);
    return { affectedRows: 0 };
  }
}

module.exports = {
  ensureLostStatusColumn,
  getLostPackagesByCustomer,
  dismissLostPackage,
};