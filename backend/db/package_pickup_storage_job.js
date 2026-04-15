/**
 * Nightly pickup logic: CALL sp_daily_package_pickup_storage when present, then always run a Node disposal
 * sweep on the app DB (same rules as migration 010). Ensures 30-day disposal hits the same database as the
 * server even if the procedure/event were never applied.
 */

// const DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1000

// async function runNodeDisposalSweep(pool) {
//   const [disRows] = await pool.query(
//     `SELECT Status_Code AS c FROM status_code
//      WHERE LOWER(TRIM(Status_Name)) = 'disposed'
//         OR REPLACE(LOWER(TRIM(Status_Name)), ' ', '') LIKE '%disposed%'
//      LIMIT 1`
//   )
//   const disposed = disRows[0]?.c
//   if (disposed == null) return

//   const atOfficePredicate = `(
//     LOWER(TRIM(REPLACE(REPLACE(REPLACE(IFNULL(scn.Status_Name, ''), '-', ' '), '_', ' '), '  ', ' '))) = 'at office'
//     OR REPLACE(LOWER(TRIM(IFNULL(scn.Status_Name, ''))), ' ', '') LIKE '%atoffice%'
//   )`

//   await pool.query(
//     `UPDATE delivery d
//      INNER JOIN package_pickup pp ON pp.Tracking_Number = d.Tracking_Number
//      INNER JOIN status_code scn ON scn.Status_Code = d.Delivery_Status_Code
//       SET d.Delivery_Status_Code = ?
//      WHERE (TRIM(IFNULL(pp.Is_picked_Up, '')) = '0' OR pp.Is_picked_Up IS NULL)
//        AND pp.Arrival_Time IS NOT NULL
//        AND DATEDIFF(CURDATE(), DATE(pp.Arrival_Time)) >= 30
//        AND ${atOfficePredicate}`,
//     [disposed]
//   )

//   await pool.query(
//     `UPDATE shipment sh
//      INNER JOIN shipment_package sp ON sp.Shipment_ID = sh.Shipment_ID
//      INNER JOIN package_pickup pp ON pp.Tracking_Number = sp.Tracking_Number
//      INNER JOIN status_code scn ON scn.Status_Code = sh.Status_Code
//      SET sh.Status_Code = ?
//      WHERE (TRIM(IFNULL(pp.Is_picked_Up, '')) = '0' OR pp.Is_picked_Up IS NULL)
//        AND pp.Arrival_Time IS NOT NULL
//        AND DATEDIFF(CURDATE(), DATE(pp.Arrival_Time)) >= 30
//        AND ${atOfficePredicate}`,
//     [disposed]
//   )
// }

// async function runDailyPackagePickupStorage(pool) {
//   try {
//     await pool.query('CALL sp_daily_package_pickup_storage()')
//   } catch (e) {
//     if (e.errno !== 1305 && !String(e.message || '').includes('does not exist')) {
//       throw e
//     }
//   }
//   await runNodeDisposalSweep(pool)
// }

// function startPackagePickupStorageJob(pool, options = {}) {
//   const intervalMs = Number(options.intervalMs) > 0 ? Number(options.intervalMs) : DEFAULT_INTERVAL_MS
//   const runOnStart = options.runOnStart !== false

//   let timer = null

//   async function tick() {
//     try {
//       await runDailyPackagePickupStorage(pool)
//     } catch (err) {
//       console.error('[package_pickup_storage_job]', err.message || err)
//     }
//   }

//   if (runOnStart) {
//     setImmediate(() => {
//       tick()
//     })
//   }

//   timer = setInterval(tick, intervalMs)

//   return () => {
//     if (timer) clearInterval(timer)
//     timer = null
//   }
// }

// module.exports = {
//   runDailyPackagePickupStorage,
//   runNodeDisposalSweep,
//   startPackagePickupStorageJob,
// }
