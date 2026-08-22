import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';
import '../../shared/widgets/bottom_nav_bar.dart';
import 'capacity_management_screen.dart';
import 'factory_dashboard_screen.dart';
import 'factory_profile_screen.dart';
import 'incoming_batches_screen.dart';
import 'processing_screen.dart';

class FactoryMainScreen extends StatefulWidget {
  const FactoryMainScreen({super.key});

  @override
  State<FactoryMainScreen> createState() => _FactoryMainScreenState();
}

class _FactoryMainScreenState extends State<FactoryMainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const FactoryDashboardScreen(),
    const IncomingBatchesScreen(),
    const ProcessingScreen(),
    const CapacityManagementScreen(),
    const FactoryProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: RoleBottomNavBar(
        role: AppConstants.roleFactory,
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}
