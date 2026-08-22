import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';
import '../../shared/widgets/bottom_nav_bar.dart';
import 'pickup_history_screen.dart';
import 'rewards_screen.dart';
import 'society_dashboard_screen.dart';
import 'society_profile_screen.dart';
import 'trust_grade_screen.dart';

class SocietyMainScreen extends StatefulWidget {
  const SocietyMainScreen({super.key});

  @override
  State<SocietyMainScreen> createState() => _SocietyMainScreenState();
}

class _SocietyMainScreenState extends State<SocietyMainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const SocietyDashboardScreen(),
    const TrustGradeScreen(),
    const PickupHistoryScreen(),
    const RewardsScreen(),
    const SocietyProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: RoleBottomNavBar(
        role: AppConstants.roleSociety,
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}
