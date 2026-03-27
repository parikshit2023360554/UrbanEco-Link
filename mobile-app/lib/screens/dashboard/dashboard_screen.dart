import 'package:flutter/material.dart';
import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import '../../theme/app_theme.dart';
import 'tabs/home_tab.dart';
import 'tabs/bin_inventory_tab.dart';
import 'tabs/batches_tab.dart';
import 'tabs/collections_tab.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  final GlobalKey<CurvedNavigationBarState> _bottomNavigationKey = GlobalKey();

  final List<Widget> _tabs = [
    const HomeTab(),
    const BinInventoryTab(),
    const SizedBox.shrink(), // Placeholder for Scanner (handled separately)
    const BatchesTab(),
    const CollectionsTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(),
      body: Stack(
        children: [
          _tabs[_currentIndex == 2 ? 0 : _currentIndex], // Index 2 is handled via navigation to /scanner
        ],
      ),
      bottomNavigationBar: CurvedNavigationBar(
        key: _bottomNavigationKey,
        index: _currentIndex,
        height: 60.0,
        items: <Widget>[
          const Icon(Icons.home_outlined, size: 30, color: Colors.white),
          const Icon(Icons.delete_outline, size: 30, color: Colors.white),
          const Icon(Icons.camera_alt, size: 40, color: Colors.white),
          const Icon(Icons.inventory_2_outlined, size: 30, color: Colors.white),
          const Icon(Icons.local_shipping_outlined, size: 30, color: Colors.white),
        ],
        color: AppColors.primaryGreen,
        buttonBackgroundColor: AppColors.primaryGreen,
        backgroundColor: Colors.white,
        animationCurve: Curves.easeInOut,
        animationDuration: const Duration(milliseconds: 600),
        onTap: (index) {
          if (index == 2) {
            Navigator.pushNamed(context, '/scanner');
            // Reset to previous index after navigation returns or ignore tap on 2
            return;
          }
          setState(() {
            _currentIndex = index;
          });
        },
        letIndexChange: (index) => index != 2,
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Good Morning, Admin 👋",
            style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
              color: AppColors.darkGreen,
            ),
          ),
          Text(
            "Friday, 27 March 2026",
            style: AppTheme.lightTheme.textTheme.bodySmall,
          ),
        ],
      ),
      actions: [
        Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined, color: AppColors.darkText),
              onPressed: () {},
            ),
            Positioned(
              right: 12,
              top: 12,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: AppColors.dangerRed,
                  shape: BoxShape.circle,
                ),
                child: const Text(
                  "3",
                  style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(width: 8),
      ],
    );
  }
}
