-- F1 Race Intelligence: Snowflake SQL blueprint (PROPOSED; not executed)
-- Source workbook sheets: circuits, championship_standings, lap_intelligence,
-- qualifying_results, race_results. Export each sheet as CSV before loading.
-- Verify column types and exact names after creating RAW tables.

-- Suggested structure (execute only in an authorized Snowflake account):
-- CREATE DATABASE IF NOT EXISTS F1_RACE_INTELLIGENCE;
-- CREATE SCHEMA IF NOT EXISTS F1_RACE_INTELLIGENCE.RAW;
-- CREATE SCHEMA IF NOT EXISTS F1_RACE_INTELLIGENCE.STAGING;
-- CREATE SCHEMA IF NOT EXISTS F1_RACE_INTELLIGENCE.MART;

-- Row-count checks after loading (adapt table names to actual DDL):
SELECT 'circuits' AS sheet_name, COUNT(*) AS row_count FROM RAW.CIRCUITS
UNION ALL SELECT 'championship_standings', COUNT(*) FROM RAW.CHAMPIONSHIP_STANDINGS
UNION ALL SELECT 'lap_intelligence', COUNT(*) FROM RAW.LAP_INTELLIGENCE
UNION ALL SELECT 'qualifying_results', COUNT(*) FROM RAW.QUALIFYING_RESULTS
UNION ALL SELECT 'race_results', COUNT(*) FROM RAW.RACE_RESULTS;

-- Null profiling for race results; do not automatically replace meaningful NULLs.
SELECT COUNT(*) AS rows_total,
       COUNT_IF(total_race_time_s IS NULL) AS missing_total_race_time,
       COUNT_IF(dnf_reason IS NULL) AS missing_dnf_reason,
       COUNT_IF(finish_position IS NULL) AS missing_finish_position,
       COUNT_IF(positions_gained IS NULL) AS missing_positions_gained,
       COUNT_IF(gap_to_leader_s IS NULL) AS missing_gap_to_leader
FROM RAW.RACE_RESULTS;

-- Exact business-key duplicate checks: investigate before deleting anything.
SELECT race_id, driver, COUNT(*) AS row_count
FROM RAW.RACE_RESULTS GROUP BY race_id, driver HAVING COUNT(*) > 1;
SELECT race_id, driver, COUNT(*) AS row_count
FROM RAW.QUALIFYING_RESULTS GROUP BY race_id, driver HAVING COUNT(*) > 1;
SELECT race_id, driver, lap_number, COUNT(*) AS row_count
FROM RAW.LAP_INTELLIGENCE GROUP BY race_id, driver, lap_number HAVING COUNT(*) > 1;
SELECT season, driver, COUNT(*) AS row_count
FROM RAW.CHAMPIONSHIP_STANDINGS GROUP BY season, driver HAVING COUNT(*) > 1;

-- DNF counts and rates by season/team (validate the encoding of dnf first).
SELECT season, team, COUNT(*) AS entries,
       SUM(IFF(dnf = 1, 1, 0)) AS dnf_count,
       DIV0(SUM(IFF(dnf = 1, 1, 0)), COUNT(*)) AS dnf_rate
FROM RAW.RACE_RESULTS GROUP BY season, team ORDER BY season, dnf_rate DESC;

-- Championship comparison by season/team.
SELECT season, team, SUM(points) AS points, SUM(wins) AS wins,
       SUM(podiums) AS podiums, SUM(pole_positions) AS poles
FROM RAW.CHAMPIONSHIP_STANDINGS GROUP BY season, team ORDER BY season, points DESC;

-- Recorded DNF reasons: preserve unknown / missing as a distinct category.
SELECT COALESCE(NULLIF(TRIM(dnf_reason), ''), 'Unknown / not recorded') AS reason,
       COUNT(*) AS records
FROM RAW.RACE_RESULTS WHERE dnf = 1 GROUP BY reason ORDER BY records DESC;

-- Qualifying gap by team/season; validate comparable session formats.
SELECT season, team, AVG(gap_to_pole_s) AS avg_gap_to_pole_s,
       COUNT(*) AS qualifying_records
FROM RAW.QUALIFYING_RESULTS GROUP BY season, team ORDER BY season, avg_gap_to_pole_s;

-- IMPORTANT: capture actual query results, query IDs, runtime and screenshots
-- before marking Snowflake activities or performance tests as completed.
