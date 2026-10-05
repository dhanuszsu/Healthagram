import { Router } from 'express';
import { authRouter } from './auth/auth.routes.js';
import { patientsRouter } from './patients/patients.routes.js';
import { encountersRouter } from './encounters/encounters.routes.js';
import { prescriptionsRouter } from './prescriptions/prescriptions.routes.js';
import { investigationsRouter } from './investigations/investigations.routes.js';
import { referralsRouter } from './referrals/referrals.routes.js';
import { careTeamRouter } from './care-team/care-team.routes.js';
import { communicationsRouter } from './communications/communications.routes.js';
import { notificationsRouter } from './notifications/notifications.routes.js';
import { auditRouter } from './audit/audit.routes.js';
import { seniorApproachRouter } from './senior-approach/senior-approach.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/patients', patientsRouter);
apiRouter.use('/encounters', encountersRouter);
apiRouter.use('/prescriptions', prescriptionsRouter);
apiRouter.use('/investigations', investigationsRouter);
apiRouter.use('/referrals', referralsRouter);
apiRouter.use('/care-team', careTeamRouter);
apiRouter.use('/communications', communicationsRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/audit', auditRouter);
apiRouter.use('/senior-approach', seniorApproachRouter);
