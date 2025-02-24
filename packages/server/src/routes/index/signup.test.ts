import { NotificationKey } from '../../models/NotificationModel';
import { execRequestC } from '../../utils/testing/apiUtils';
import { beforeAllDb, afterAllTests, beforeEachDb, models } from '../../utils/testing/testUtils';

describe('index_signup', function() {

	beforeAll(async () => {
		await beforeAllDb('index_signup');
	});

	afterAll(async () => {
		await afterAllTests();
	});

	beforeEach(async () => {
		await beforeEachDb();
	});

	test('should create a new account', async function() {
		const context = await execRequestC('', 'POST', 'signup', {
			full_name: 'Toto',
			email: 'toto@example.com',
			password: 'testing',
			password2: 'testing',
		});

		// Check that the user has been created
		const user = await models().user().loadByEmail('toto@example.com');
		expect(user).toBeTruthy();
		expect(user.email_confirmed).toBe(0);

		// Check that the user is logged in
		const session = await models().session().load(context.cookies.get('sessionId'));
		expect(session.user_id).toBe(user.id);

		// Check that the notification has been created
		const notifications = await models().notification().allUnreadByUserId(user.id);
		expect(notifications.length).toBe(1);
		expect(notifications[0].key).toBe(NotificationKey.ConfirmEmail);
	});

});
