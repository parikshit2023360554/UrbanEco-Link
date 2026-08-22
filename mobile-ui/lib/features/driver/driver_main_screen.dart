import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';
import '../../shared/widgets/bottom_nav_bar.dart';
import 'driver_dashboard_screen.dart';
import 'driver_history_screen.dart';
import 'driver_profile_screen.dart';
import 'qr_scanner_screen.dart';
import 'todays_assignments_screen.dart';

class DriverMainScreen extends StatefulWidget {
  const DriverMainScreen({super.key});

  @override
  State<DriverMainScreen> createState() => _DriverMainScreenState();
}

class _DriverMainScreenState extends State<DriverMainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DriverDashboardScreen(),
    const TodaysAssignmentsScreen(),
    const QrScannerScreen(),
    const DriverHistoryScreen(),
    const DriverProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: RoleBottomNavBar(
        role: AppConstants.roleDriver,
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}
