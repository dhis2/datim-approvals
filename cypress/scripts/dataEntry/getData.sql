-- gets data for aggregateData.test.js

SELECT *
FROM analytics
WHERE pe='2019Q3'
AND dx='RhkU5KjtAi6'
AND (co='xjIOzgKKqaE' OR co='srbCCscTJaK' OR co='nsATUhYrzYh')
--AND ao='BOKwiEdAMzQ'

