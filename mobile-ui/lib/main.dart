import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/constants/app_constants.dart';
import 'core/routes/app_routes.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/forgot_password_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/otp_verification_screen.dart';
import 'features/auth/registration_screen.dart';
import 'features/auth/splash_screen.dart';
import 'features/driver/driver_dashboard_screen.dart';
import 'features/driver/driver_history_screen.dart';
import 'features/driver/driver_main_screen.dart';
import 'features/driver/driver_profile_screen.dart';
import 'features/driver/driver_settings_screen.dart';
import 'features/driver/qr_scanner_screen.dart';
import 'features/driver/todays_assignments_screen.dart';
import 'features/factory/capacity_management_screen.dart';
import 'features/factory/factory_dashboard_screen.dart';
import 'features/factory/factory_main_screen.dart';
import 'features/factory/factory_profile_screen.dart';
import 'features/factory/factory_settings_screen.dart';
import 'features/factory/factory_status_controls_screen.dart';
import 'features/factory/incoming_batches_screen.dart';
import 'features/factory/processing_history_screen.dart';
import 'features/factory/processing_screen.dart';
import 'features/society/pickup_history_screen.dart';
import 'features/society/request_pickup_screen.dart';
import 'features/society/rewards_screen.dart';
import 'features/society/society_dashboard_screen.dart';
import 'features/society/society_main_screen.dart';
import 'features/society/society_profile_screen.dart';
import 'features/society/society_settings_screen.dart';
import 'features/society/trust_grade_screen.dart';
import 'services/auth_service.dart';
import 'services/driver_service.dart';
import 'services/factory_service.dart';
import 'services/society_service.dart';
import 'shared/widgets/notification_center.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const UrbanEcoLinkApp());
}

class UrbanEcoLinkApp extends StatelessWidget {
  const UrbanEcoLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => SocietyService()),
        ChangeNotifierProvider(create: (_) => DriverService()),
        ChangeNotifierProvider(create: (_) => FactoryService()),
      ],
      child: MaterialApp(
        title: AppConstants.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: AppRoutes.splash,
        routes: {
          AppRoutes.splash: (context) => const SplashScreen(),
          AppRoutes.login: (context) => const LoginScreen(),
          AppRoutes.register: (context) => const RegistrationScreen(),
          AppRoutes.forgotPassword: (context) => const ForgotPasswordScreen(),
          AppRoutes.otpVerification: (context) => const OtpVerificationScreen(),
          AppRoutes.notifications: (context) => const NotificationCenterScreen(),

          // Society Routes
          AppRoutes.societyMain: (context) => const SocietyMainScreen(),
          AppRoutes.societyDashboard: (context) => const SocietyDashboardScreen(),
          AppRoutes.societyRequestPickup: (context) => const RequestPickupScreen(),
          AppRoutes.societyPickupHistory: (context) => const PickupHistoryScreen(),
          AppRoutes.societyRewards: (context) => const RewardsScreen(),
          AppRoutes.societyTrustGrade: (context) => const TrustGradeScreen(),
          AppRoutes.societyProfile: (context) => const SocietyProfileScreen(),
          AppRoutes.societySettings: (context) => const SocietySettingsScreen(),

          // Driver Routes
          AppRoutes.driverMain: (context) => const DriverMainScreen(),
          AppRoutes.driverDashboard: (context) => const DriverDashboardScreen(),
          AppRoutes.driverAssignments: (context) => const TodaysAssignmentsScreen(),
          AppRoutes.driverQrScanner: (context) => const QrScannerScreen(),
          AppRoutes.driverHistory: (context) => const DriverHistoryScreen(),
          AppRoutes.driverProfile: (context) => const DriverProfileScreen(),
          AppRoutes.driverSettings: (context) => const DriverSettingsScreen(),

          // Factory Routes
          AppRoutes.factoryMain: (context) => const FactoryMainScreen(),
          AppRoutes.factoryDashboard: (context) => const FactoryDashboardScreen(),
          AppRoutes.factoryStatusControls: (context) => const FactoryStatusControlsScreen(),
          AppRoutes.factoryCapacity: (context) => const CapacityManagementScreen(),
          AppRoutes.factoryIncomingBatches: (context) => const IncomingBatchesScreen(),
          AppRoutes.factoryProcessing: (context) => const ProcessingScreen(),
          AppRoutes.factoryHistory: (context) => const ProcessingHistoryScreen(),
          AppRoutes.factoryProfile: (context) => const FactoryProfileScreen(),
          AppRoutes.factorySettings: (context) => const FactorySettingsScreen(),
        },
      ),
    );
  }
}
