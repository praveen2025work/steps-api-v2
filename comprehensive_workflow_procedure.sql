
 need your help to complete and enhance the stored procedure FINWFNE_DEMO.GET_USER_WORKFLOW_DATA.

🎯 Objective:

This procedure should return process-related data for a given user and business date, but with hierarchical context included — particularly:

All levels of the application hierarchy the user is entitled to
Process data tied to those hierarchy levels
User’s role-based actions across applications (e.g., Producer, Approver)
We want this to mimic the logic used in the existing procedure FINWFNE_DEMO.USP_GETWFPROCESS, but with some key differences.

✅ Key Inputs:

p_username (e.g., 'kumarp15')
p_business_date (e.g., 27-JUN-2025)
📦 Data Requirements:

Hierarchy Info
From: FINWFNE_DEMO.WORKFLOW_HIERARCHY_DATA
Filter by ISACTIVE = 'Y', STARTDATE <= business_date, and (EXPIRYDATE IS NULL OR >= business_date)
Output should preserve hierarchy levels (Level 1, Level 2), column values, and parent-child relationships.
Process Data
Same as USP_GETWFPROCESS — include nested tables and process-level attributes
Join hierarchy data to bring in app-level context (Level 1, Level 2 IDs)
Role-Based Filtering
Pull user’s roles per application (Producer, Approver, etc.)
Logic to determine these roles should be reused from USP_GETWFPROCESS
Tollgate Permissions
For each app, check WORKFLOW_APP_PARAMS for WF_TOLLGATE_PERMISSIONS = 'Y'
Only include apps that pass this tollgate check
Output Format
One consolidated result set (returned via SYS_REFCURSOR)
Each row should include:
Application ID
Level 1 and Level 2 hierarchy values
All relevant process info (status, user action, timestamps)
User’s role in context of each process
