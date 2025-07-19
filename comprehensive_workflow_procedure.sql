-- Comprehensive Workflow Data Retrieval Procedure
-- Input: username, business_date
-- Returns: All workflow data including process, stage, substage and associated tables

CREATE OR REPLACE PROCEDURE GET_USER_WORKFLOW_DATA(
    p_username IN VARCHAR2,
    p_business_date IN DATE,
    -- Output cursors for different data sets
    cur_user_info OUT SYS_REFCURSOR,
    cur_applications OUT SYS_REFCURSOR,
    cur_hierarchy OUT SYS_REFCURSOR,
    cur_processes OUT SYS_REFCURSOR,
    cur_stages OUT SYS_REFCURSOR,
    cur_substages OUT SYS_REFCURSOR,
    cur_dependencies OUT SYS_REFCURSOR,
    cur_files OUT SYS_REFCURSOR,
    cur_parameters OUT SYS_REFCURSOR,
    cur_attestations OUT SYS_REFCURSOR,
    cur_roles OUT SYS_REFCURSOR,
    cur_notifications OUT SYS_REFCURSOR
)
IS
BEGIN
    -- 1. User Information and Roles
    OPEN cur_user_info FOR
    SELECT DISTINCT
        wu.USERNAME,
        wu.ISACTIVE as USER_ACTIVE,
        wr.ROLEID,
        wr.ROLE,
        wr.DEPARTMENT,
        wr.USERTYPE,
        wr.ISREADWRITE,
        wurm.APP_ID,
        wa.NAME as APPLICATION_NAME,
        wa.CATEGORY as APPLICATION_CATEGORY,
        wa.DESCRIPTION as APPLICATION_DESCRIPTION
    FROM WORKFLOW_USERS wu
    LEFT JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON UPPER(wu.USERNAME) = UPPER(wurm.USERNAME)
    LEFT JOIN WORKFLOW_ROLES wr ON wurm.ROLEID = wr.ROLEID
    LEFT JOIN WORKFLOW_APPLICATION wa ON wurm.APP_ID = wa.APP_ID
    WHERE UPPER(wu.USERNAME) = UPPER(p_username)
    AND wu.ISACTIVE = 1
    AND (wr.ISACTIVE IS NULL OR wr.ISACTIVE = 1)
    AND (wa.ISACTIVE IS NULL OR wa.ISACTIVE = 1)
    ORDER BY wurm.APP_ID, wr.ROLEID;

    -- 2. Applications accessible to user
    OPEN cur_applications FOR
    SELECT DISTINCT
        wa.APP_ID,
        wa.NAME,
        wa.CATEGORY,
        wa.SERVICE_URI,
        wa.DESCRIPTION,
        wa.ISACTIVE,
        wa.CRONEXPRESSION,
        wa.STARTDATE,
        wa.EXPIRYDATE,
        wa.USERUNCALENDAR,
        wa.RUNDATEOFFSET,
        wa.ISRUNONWEEKDAYONLY,
        wa.ENTITLEMENT_MAPPING,
        wa.ISLOCKINGENABLED,
        wa.LOCKINGROLE,
        -- Application completion percentage (calculated)
        ROUND(
            (SELECT COUNT(*) FROM WORKFLOW_PROCESS wp2 
             WHERE wp2.APP_ID = wa.APP_ID 
             AND wp2.BUSINESSDATE = p_business_date 
             AND wp2.STATUS IN ('completed', 'Completed')) * 100.0 /
            NULLIF((SELECT COUNT(*) FROM WORKFLOW_PROCESS wp3 
                    WHERE wp3.APP_ID = wa.APP_ID 
                    AND wp3.BUSINESSDATE = p_business_date), 0), 2
        ) as COMPLETION_PERCENTAGE
    FROM WORKFLOW_APPLICATION wa
    INNER JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON wa.APP_ID = wurm.APP_ID
    WHERE UPPER(wurm.USERNAME) = UPPER(p_username)
    AND wa.ISACTIVE = 1
    ORDER BY wa.APP_ID;

    -- 3. User Hierarchy and Entitlements
    OPEN cur_hierarchy FOR
    SELECT DISTINCT
        wh.HIERARCHY_ID,
        wh.HIERARCHYNAME,
        wh.HIERARCHYDESCRIPTION,
        wh.HIERARCHYLEVEL,
        wh.COLNAME,
        wh.PARENTHIERARCHYLEVEL,
        wh.PARENTCOLNAME,
        wh.ISUSEDFORENTITLEMENTS,
        wh.ISUSEDFORWORKFLOWINSTANCE,
        whd.COLVALUE,
        whd.PARENTCOLVALUE,
        whd.ISACTIVE as HIERARCHY_DATA_ACTIVE,
        wahm.APP_ID
    FROM WORKFLOW_HIERARCHY wh
    INNER JOIN WORKFLOW_HIERARCHY_DATA whd ON wh.HIERARCHY_ID = whd.HIERARCHY_ID
    INNER JOIN WORKFLOW_APP_HIERARCHY_MAP wahm ON wh.HIERARCHY_ID = wahm.HIERARCHY_ID
    INNER JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON wahm.APP_ID = wurm.APP_ID
    WHERE UPPER(wurm.USERNAME) = UPPER(p_username)
    AND whd.ISACTIVE = 1
    AND CURRENT_DATE BETWEEN wh.STARTDATE AND wh.EXPIRYDATE
    AND CURRENT_DATE BETWEEN whd.STARTDATE AND whd.EXPIRYDATE
    ORDER BY wh.HIERARCHY_ID, wh.HIERARCHYLEVEL, whd.COLVALUE;

    -- 4. Workflow Processes (Only "in progress" status)
    OPEN cur_processes FOR
    SELECT DISTINCT
        wp.WORKFLOW_PROCESS_ID,
        wp.STATUS,
        wp.BUSINESSDATE,
        wp.WORKFLOW_APP_CONFIG_ID,
        wp.APP_GROUP_ID,
        wp.APP_ID,
        wp.STAGE_ID,
        wp.SUBSTAGE_ID,
        wp.DEP_SUB_STAGE_SEQ,
        wp.AUTO,
        wp.ATTEST,
        wp.UPLOAD,
        wp.APPROVAL,
        wp.ADHOC,
        wp.ISALTERYX,
        wp.ISFORCESTART,
        wp.ISRERUN,
        wp.UPDATEDBY,
        wp.UPDATEDON,
        wp.ATTESTEDBY,
        wp.ATTESTEDON,
        wp.COMPLETEDBY,
        wp.COMPLETEDON,
        wp.DURATION,
        wp.MESSAGE,
        wp.ENTITLEMENT_MAPPING,
        wp.ISLOCKED,
        wp.LOCKEDBY,
        wp.LOCKEDON,
        wp.ISACTIVE as PROCESS_ACTIVE,
        wa.NAME as APPLICATION_NAME,
        wag.GROUP_NAME,
        wag.DESCRIPTION as GROUP_DESCRIPTION
    FROM WORKFLOW_PROCESS wp
    INNER JOIN WORKFLOW_APPLICATION wa ON wp.APP_ID = wa.APP_ID
    LEFT JOIN WORKFLOW_APP_GROUING wag ON wp.APP_GROUP_ID = wag.APP_GROUP_ID
    INNER JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON wa.APP_ID = wurm.APP_ID
    WHERE UPPER(wurm.USERNAME) = UPPER(p_username)
    AND wp.BUSINESSDATE = p_business_date
    AND wp.ISACTIVE = '1'
    AND UPPER(wp.STATUS) = 'IN PROGRESS'
    ORDER BY wp.APP_ID, wp.APP_GROUP_ID, wp.STAGE_ID, wp.DEP_SUB_STAGE_SEQ;

    -- 5. Stages Information
    OPEN cur_stages FOR
    SELECT DISTINCT
        ws.STAGE_ID,
        ws.NAME as STAGE_NAME,
        ws.APP_ID,
        ws.DESCRIPTION as STAGE_DESCRIPTION,
        ws.UPDATEDBY,
        ws.UPDATEDON,
        wa.NAME as APPLICATION_NAME,
        -- Stage completion percentage
        ROUND(
            (SELECT COUNT(*) FROM WORKFLOW_PROCESS wp_stage 
             WHERE wp_stage.STAGE_ID = ws.STAGE_ID 
             AND wp_stage.BUSINESSDATE = p_business_date 
             AND wp_stage.STATUS IN ('completed', 'Completed')) * 100.0 /
            NULLIF((SELECT COUNT(*) FROM WORKFLOW_PROCESS wp_stage2 
                    WHERE wp_stage2.STAGE_ID = ws.STAGE_ID 
                    AND wp_stage2.BUSINESSDATE = p_business_date), 0), 2
        ) as STAGE_COMPLETION_PERCENTAGE
    FROM WORKFLOW_STAGE ws
    INNER JOIN WORKFLOW_APPLICATION wa ON ws.APP_ID = wa.APP_ID
    INNER JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON wa.APP_ID = wurm.APP_ID
    WHERE UPPER(wurm.USERNAME) = UPPER(p_username)
    ORDER BY ws.APP_ID, ws.STAGE_ID;

    -- 6. Substages Information (Only for "in progress" processes)
    OPEN cur_substages FOR
    SELECT DISTINCT
        wss.SUBSTAGE_ID,
        wss.COMPONENTNAME,
        wss.SERVICELINE,
        wss.NAME as SUBSTAGE_NAME,
        wss.DEFAULTSTAGE,
        wss.PARAM_MAPPING,
        wss.ATTESTATION_MAPPING,
        wss.UPDATEDBY,
        wss.UPDATEDON,
        wss.ENTITLEMENT_MAPPING,
        wss.TEMPLATE_ID,
        wss.SEND_EMAIL_AT_START,
        wss.FOLLOW_UP,
        wss.EXPECTEDTIME,
        wss.EXPECTEDDURATION,
        wp.WORKFLOW_PROCESS_ID,
        wp.STATUS as PROCESS_STATUS,
        wp.APP_ID,
        wp.STAGE_ID,
        ws.NAME as STAGE_NAME,
        wp.AUTO,
        wp.ATTEST,
        wp.UPLOAD,
        wp.APPROVAL,
        wp.ADHOC,
        wp.ISALTERYX
    FROM WORKFLOW_SUBSTAGE wss
    INNER JOIN WORKFLOW_PROCESS wp ON wss.SUBSTAGE_ID = wp.SUBSTAGE_ID
    INNER JOIN WORKFLOW_STAGE ws ON wp.STAGE_ID = ws.STAGE_ID
    INNER JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON wp.APP_ID = wurm.APP_ID
    WHERE UPPER(wurm.USERNAME) = UPPER(p_username)
    AND wp.BUSINESSDATE = p_business_date
    AND wp.ISACTIVE = '1'
    AND UPPER(wp.STATUS) = 'IN PROGRESS'
    ORDER BY wp.APP_ID, wp.STAGE_ID, wp.DEP_SUB_STAGE_SEQ;

    -- 7. Dependencies (Only for "in progress" processes)
    OPEN cur_dependencies FOR
    SELECT DISTINCT
        wpd.WORKFLOW_PROCESS_ID,
        wpd.DEPENDENCY_SUBSTAGE_ID,
        wpd.STATUS as DEPENDENCY_STATUS,
        wpd.UPDATEDBY,
        wpd.UPDATEDON,
        wss_dep.NAME as DEPENDENCY_SUBSTAGE_NAME,
        wp_main.SUBSTAGE_ID as MAIN_SUBSTAGE_ID,
        wss_main.NAME as MAIN_SUBSTAGE_NAME,
        wp_main.APP_ID,
        wp_main.STAGE_ID
    FROM WORKFLOW_PROCESS_DEP wpd
    INNER JOIN WORKFLOW_PROCESS wp_main ON wpd.WORKFLOW_PROCESS_ID = wp_main.WORKFLOW_PROCESS_ID
    INNER JOIN WORKFLOW_SUBSTAGE wss_main ON wp_main.SUBSTAGE_ID = wss_main.SUBSTAGE_ID
    INNER JOIN WORKFLOW_SUBSTAGE wss_dep ON wpd.DEPENDENCY_SUBSTAGE_ID = wss_dep.SUBSTAGE_ID
    INNER JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON wp_main.APP_ID = wurm.APP_ID
    WHERE UPPER(wurm.USERNAME) = UPPER(p_username)
    AND wp_main.BUSINESSDATE = p_business_date
    AND wp_main.ISACTIVE = '1'
    AND UPPER(wp_main.STATUS) = 'IN PROGRESS'
    ORDER BY wp_main.APP_ID, wp_main.STAGE_ID, wp_main.DEP_SUB_STAGE_SEQ;

    -- 8. Files (Only for "in progress" processes)
    OPEN cur_files FOR
    SELECT DISTINCT
        wpf.WORKFLOW_PROCESS_ID,
        wpf.NAME as FILE_NAME,
        wpf.PARAM_TYPE,
        wpf.VALUE as FILE_VALUE,
        wpf.REQUIRED,
        wpf.STATUS as FILE_STATUS,
        wpf.DESCRIPTION as FILE_DESCRIPTION,
        wpf.EXPECTEDVALUE,
        wpf.CREATEDON,
        wp.SUBSTAGE_ID,
        wss.NAME as SUBSTAGE_NAME,
        wp.APP_ID,
        wp.STAGE_ID,
        ws.NAME as STAGE_NAME
    FROM WORKFLOW_PROCESS_FILE wpf
    INNER JOIN WORKFLOW_PROCESS wp ON wpf.WORKFLOW_PROCESS_ID = wp.WORKFLOW_PROCESS_ID
    INNER JOIN WORKFLOW_SUBSTAGE wss ON wp.SUBSTAGE_ID = wss.SUBSTAGE_ID
    INNER JOIN WORKFLOW_STAGE ws ON wp.STAGE_ID = ws.STAGE_ID
    INNER JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON wp.APP_ID = wurm.APP_ID
    WHERE UPPER(wurm.USERNAME) = UPPER(p_username)
    AND wp.BUSINESSDATE = p_business_date
    AND wp.ISACTIVE = '1'
    AND UPPER(wp.STATUS) = 'IN PROGRESS'
    ORDER BY wp.APP_ID, wp.STAGE_ID, wp.DEP_SUB_STAGE_SEQ, wpf.NAME;

    -- 9. Parameters (Daily, Global, and Process)
    OPEN cur_parameters FOR
    SELECT 
        'DAILY' as PARAM_TYPE,
        wdp.PARAM_ID,
        wdp.NAME as PARAM_NAME,
        wdp.VALUE as PARAM_VALUE,
        wdp.BUSINESSDATE,
        wdp.APP_GROUP_ID,
        wdp.APP_ID,
        wdp.UPDATEDBY,
        wdp.UPDATEDON,
        wdp.ISEDITABLE,
        wdp.COMMENTS,
        NULL as WORKFLOW_PROCESS_ID,
        wa.NAME as APPLICATION_NAME
    FROM WORKFLOW_DAILY_PARAMS wdp
    INNER JOIN WORKFLOW_APPLICATION wa ON wdp.APP_ID = wa.APP_ID
    INNER JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON wa.APP_ID = wurm.APP_ID
    WHERE UPPER(wurm.USERNAME) = UPPER(p_username)
    AND wdp.BUSINESSDATE = p_business_date
    
    UNION ALL
    
    SELECT 
        'GLOBAL' as PARAM_TYPE,
        wgp.PARAM_ID,
        wgp.NAME as PARAM_NAME,
        wgp.VALUE as PARAM_VALUE,
        p_business_date as BUSINESSDATE,
        wgp.APP_GROUP_ID,
        wgp.APP_ID,
        wgp.UPDATEDBY,
        wgp.UPDATEDON,
        wgp.ISEDITABLE,
        NULL as COMMENTS,
        NULL as WORKFLOW_PROCESS_ID,
        wa.NAME as APPLICATION_NAME
    FROM WORKFLOW_GLOBAL_PARAMS wgp
    INNER JOIN WORKFLOW_APPLICATION wa ON wgp.APP_ID = wa.APP_ID
    INNER JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON wa.APP_ID = wurm.APP_ID
    WHERE UPPER(wurm.USERNAME) = UPPER(p_username)
    
    UNION ALL
    
    SELECT 
        'PROCESS' as PARAM_TYPE,
        NULL as PARAM_ID,
        wpp.NAME as PARAM_NAME,
        wpp.VALUE as PARAM_VALUE,
        wp.BUSINESSDATE,
        wp.APP_GROUP_ID,
        wp.APP_ID,
        wp.UPDATEDBY,
        wp.UPDATEDON,
        NULL as ISEDITABLE,
        NULL as COMMENTS,
        wpp.WORKFLOW_PROCESS_ID,
        wa.NAME as APPLICATION_NAME
    FROM WORKFLOW_PROCESS_PARAM wpp
    INNER JOIN WORKFLOW_PROCESS wp ON wpp.WORKFLOW_PROCESS_ID = wp.WORKFLOW_PROCESS_ID
    INNER JOIN WORKFLOW_APPLICATION wa ON wp.APP_ID = wa.APP_ID
    INNER JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON wa.APP_ID = wurm.APP_ID
    WHERE UPPER(wurm.USERNAME) = UPPER(p_username)
    AND wp.BUSINESSDATE = p_business_date
    AND wp.ISACTIVE = '1'
    AND UPPER(wp.STATUS) = 'IN PROGRESS'
    
    ORDER BY APP_ID, PARAM_TYPE, PARAM_NAME;

    -- 10. Attestations (Only for "in progress" processes)
    OPEN cur_attestations FOR
    SELECT DISTINCT
        wpa.WORKFLOW_PROCESS_ID,
        wpa.ATTESTATION_ID,
        wpa.STATUS as ATTESTATION_STATUS,
        wpa.ATTESTEDBY,
        wpa.ATTESTEDON,
        wa_att.NAME as ATTESTATION_NAME,
        wa_att.TYPE as ATTESTATION_TYPE,
        wa_att.DESCRIPTION as ATTESTATION_DESCRIPTION,
        wp.SUBSTAGE_ID,
        wss.NAME as SUBSTAGE_NAME,
        wp.APP_ID,
        wp.STAGE_ID,
        ws.NAME as STAGE_NAME
    FROM WORKFLOW_PROCESS_ATTEST wpa
    INNER JOIN WORKFLOW_ATTEST wa_att ON wpa.ATTESTATION_ID = wa_att.ATTESTATION_ID
    INNER JOIN WORKFLOW_PROCESS wp ON wpa.WORKFLOW_PROCESS_ID = wp.WORKFLOW_PROCESS_ID
    INNER JOIN WORKFLOW_SUBSTAGE wss ON wp.SUBSTAGE_ID = wss.SUBSTAGE_ID
    INNER JOIN WORKFLOW_STAGE ws ON wp.STAGE_ID = ws.STAGE_ID
    INNER JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON wp.APP_ID = wurm.APP_ID
    WHERE UPPER(wurm.USERNAME) = UPPER(p_username)
    AND wp.BUSINESSDATE = p_business_date
    AND wp.ISACTIVE = '1'
    AND UPPER(wp.STATUS) = 'IN PROGRESS'
    ORDER BY wp.APP_ID, wp.STAGE_ID, wp.DEP_SUB_STAGE_SEQ;

    -- 11. User Roles and Permissions
    OPEN cur_roles FOR
    SELECT DISTINCT
        wr.ROLEID,
        wr.DEPARTMENT,
        wr.ROLE,
        wr.USERTYPE,
        wr.ISREADWRITE,
        wr.ISACTIVE as ROLE_ACTIVE,
        wr.STARTDATE,
        wr.EXPIRYDATE,
        wurm.APP_ID,
        wa.NAME as APPLICATION_NAME,
        -- Check if user has acted in this role today
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM WORKFLOW_PROCESS wp_check
                WHERE wp_check.APP_ID = wurm.APP_ID
                AND wp_check.BUSINESSDATE = p_business_date
                AND (
                    (wr.USERTYPE = 'PRODUCER' AND UPPER(wp_check.UPDATEDBY) = UPPER(p_username)) OR
                    (wr.USERTYPE = 'APPROVER' AND UPPER(wp_check.ATTESTEDBY) = UPPER(p_username))
                )
            ) THEN 'ACTED'
            ELSE 'AVAILABLE'
        END as ROLE_STATUS
    FROM WORKFLOW_ROLES wr
    INNER JOIN WORKFLOW_APP_USER_ROLE_MAP wurm ON wr.ROLEID = wurm.ROLEID
    INNER JOIN WORKFLOW_APPLICATION wa ON wurm.APP_ID = wa.APP_ID
    WHERE UPPER(wurm.USERNAME) = UPPER(p_username)
    AND wr.ISACTIVE = 1
    AND CURRENT_DATE BETWEEN wr.STARTDATE AND wr.EXPIRYDATE
    ORDER BY wurm.APP_ID, wr.ROLEID;

    -- 12. Notifications (Only for "in progress" processes)
    OPEN cur_notifications FOR
    SELECT DISTINCT
        wn.NOTIFICATION_ID,
        wn.APP_GROUP_ID,
        wn.APP_ID,
        wn.SUBSTAGE_ID,
        wn.USER_ID,
        wn.UPDATEDBY,
        wn.UPDATEDON,
        wa.NAME as APPLICATION_NAME,
        wss.NAME as SUBSTAGE_NAME,
        ws.NAME as STAGE_NAME,
        wp.WORKFLOW_PROCESS_ID,
        wp.STATUS as PROCESS_STATUS
    FROM WORKFLOW_NOTIFICATION wn
    INNER JOIN WORKFLOW_APPLICATION wa ON wn.APP_ID = wa.APP_ID
    INNER JOIN WORKFLOW_SUBSTAGE wss ON wn.SUBSTAGE_ID = wss.SUBSTAGE_ID
    LEFT JOIN WORKFLOW_PROCESS wp ON wn.APP_ID = wp.APP_ID 
        AND wn.SUBSTAGE_ID = wp.SUBSTAGE_ID 
        AND wp.BUSINESSDATE = p_business_date
        AND UPPER(wp.STATUS) = 'IN PROGRESS'
    LEFT JOIN WORKFLOW_STAGE ws ON wp.STAGE_ID = ws.STAGE_ID
    WHERE (UPPER(wn.USER_ID) = UPPER(p_username)
    OR EXISTS (
        SELECT 1 FROM WORKFLOW_APP_USER_ROLE_MAP wurm 
        WHERE wurm.APP_ID = wn.APP_ID 
        AND UPPER(wurm.USERNAME) = UPPER(p_username)
    ))
    AND wp.WORKFLOW_PROCESS_ID IS NOT NULL  -- Only show notifications for in-progress processes
    ORDER BY wn.APP_ID, wn.NOTIFICATION_ID;

END GET_USER_WORKFLOW_DATA;
/

-- Example usage:
/*
DECLARE
    cur_user_info SYS_REFCURSOR;
    cur_applications SYS_REFCURSOR;
    cur_hierarchy SYS_REFCURSOR;
    cur_processes SYS_REFCURSOR;
    cur_stages SYS_REFCURSOR;
    cur_substages SYS_REFCURSOR;
    cur_dependencies SYS_REFCURSOR;
    cur_files SYS_REFCURSOR;
    cur_parameters SYS_REFCURSOR;
    cur_attestations SYS_REFCURSOR;
    cur_roles SYS_REFCURSOR;
    cur_notifications SYS_REFCURSOR;
BEGIN
    GET_USER_WORKFLOW_DATA(
        p_username => 'john.doe',
        p_business_date => DATE '2025-07-19',
        cur_user_info => cur_user_info,
        cur_applications => cur_applications,
        cur_hierarchy => cur_hierarchy,
        cur_processes => cur_processes,
        cur_stages => cur_stages,
        cur_substages => cur_substages,
        cur_dependencies => cur_dependencies,
        cur_files => cur_files,
        cur_parameters => cur_parameters,
        cur_attestations => cur_attestations,
        cur_roles => cur_roles,
        cur_notifications => cur_notifications
    );
END;
/
*/