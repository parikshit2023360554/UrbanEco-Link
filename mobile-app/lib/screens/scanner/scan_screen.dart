import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.8, end: 1.0).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _simulateScan() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle, color: AppColors.primaryGreen, size: 60),
              const SizedBox(height: 16),
              const Text("Plastic Bottle Detected", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              const Text("Place in ♻️ Recyclable Bin", style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              const Text("+2 pts will be added after verified pickup", style: TextStyle(color: AppColors.gray, fontSize: 12)),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("Got it!"),
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Camera Preview Placeholder
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ScaleTransition(
                  scale: _animation,
                  child: Container(
                    width: 250,
                    height: 250,
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.primaryGreen, width: 2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Stack(
                      children: [
                        _buildCorner(0),
                        _buildCorner(1),
                        _buildCorner(2),
                        _buildCorner(3),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text("Point camera at waste item", style: TextStyle(color: Colors.white, fontSize: 16)),
              ],
            ),
          ),
          // Top Header
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
                const Expanded(
                  child: Text(
                    "Scan Waste Item",
                    style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(width: 48), // Balancing
              ],
            ),
          ),
          // Bottom Info Card
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text("Ready to Scan", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text(
                    "AI will identify waste type and guide you to correct bin",
                    style: TextStyle(color: AppColors.gray),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: _simulateScan,
                    child: const Text("Start Scan"),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCorner(int index) {
    double top = (index == 0 || index == 1) ? -2 : 0;
    double bottom = (index == 2 || index == 3) ? -2 : 0;
    double left = (index == 0 || index == 2) ? -2 : 0;
    double right = (index == 1 || index == 3) ? -2 : 0;

    return Positioned(
      top: top != 0 ? top : null,
      bottom: bottom != 0 ? bottom : null,
      left: left != 0 ? left : null,
      right: right != 0 ? right : null,
      child: Container(
        width: 30,
        height: 30,
        decoration: BoxDecoration(
          border: Border(
            top: (index == 0 || index == 1) ? const BorderSide(color: AppColors.primaryGreen, width: 6) : BorderSide.none,
            bottom: (index == 2 || index == 3) ? const BorderSide(color: AppColors.primaryGreen, width: 6) : BorderSide.none,
            left: (index == 0 || index == 2) ? const BorderSide(color: AppColors.primaryGreen, width: 6) : BorderSide.none,
            right: (index == 1 || index == 3) ? const BorderSide(color: AppColors.primaryGreen, width: 6) : BorderSide.none,
          ),
        ),
      ),
    );
  }
}
