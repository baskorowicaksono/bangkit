import App from './app';
import ActivityRoute from './routes/activity.route';
import AuthRoute from './routes/auth.route';
import HighlightedDestinationRoute from './routes/highlighted-destination.route';
import UserRoute from './routes/user.route';
import validateEnv from './utils/validateEnv';

process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

validateEnv();

const app = new App([new AuthRoute(), new ActivityRoute(), new UserRoute(), new HighlightedDestinationRoute()]);

app.listen();
