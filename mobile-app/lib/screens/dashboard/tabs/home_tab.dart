import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../theme/app_theme.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => Future.delayed(const Duration(seconds: 1)),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Society Info Card
            _buildSocietyCard(),
            const SizedBox(height: 24),

            // Stat Cards Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.5,
              children: [
                _buildStatCard("Current Rank", "A+", Icons.emoji_events, AppColors.primaryGreen),
                _buildStatCard("Total Diverted", "1,240 kg", Icons.recycling, Colors.blue),
                _buildStatCard("Accuracy", "94.2%", Icons.track_changes, Colors.orange),
                _buildStatCard("Next Pickup", "Tomorrow", Icons.calendar_today, Colors.purple),
              ],
            ),
            const SizedBox(height: 24),

            // Bin Status Row
            _buildSectionHeader("Bin Status", onAction: () {}),
            const SizedBox(height: 16),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildBinStatusCard("Organic", 0.72, AppColors.warningOrange, "🌱"),
                  const SizedBox(width: 12),
                  _buildBinStatusCard("Recyclable", 0.45, AppColors.primaryGreen, "♻️"),
                  const SizedBox(width: 12),
                  _buildBinStatusCard("Non-Recycle", 0.88, AppColors.dangerRed, "🗑️"),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Today's Scan Log
            _buildSectionHeader("Today's Scan Log", badge: "Updated Daily"),
            const SizedBox(height: 16),
            _buildScanLog(),
            const SizedBox(height: 12),
            Center(
              child: TextButton(
                onPressed: () {},
                child: const Text("View Full Log", style: TextStyle(color: AppColors.primaryGreen)),
              ),
            ),
            const SizedBox(height: 24),

            // Eco Points Progress
            _buildEcoPointsCard(),
            const SizedBox(height: 100), // Spacing for bottom bar
          ],
        ),
      ),
    );
  }

  Widget _buildSocietyCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primaryGreen, AppColors.darkGreen],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Raghuma Hostel",
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Row(
                children: const [
                  Icon(Icons.location_on, color: Colors.white70, size: 14),
                  SizedBox(width: 4),
                  Text("Greater Noida", style: TextStyle(color: Colors.white70, fontSize: 12)),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  "A+",
                  style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text("860 pts", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Row(
                children: const [
                  Icon(Icons.arrow_upward, color: Colors.white, size: 14),
                  Text("95 pts this month", style: TextStyle(color: Colors.white70, fontSize: 10)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String val, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(val, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.darkText)),
          Text(title, style: const TextStyle(fontSize: 10, color: AppColors.gray)),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, {VoidCallback? onAction, String? badge}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.darkText)),
            if (badge != null) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(4)),
                child: Text(badge, style: const TextStyle(fontSize: 10, color: AppColors.gray)),
              ),
            ],
          ],
        ),
        if (onAction != null)
          TextButton(
            onPressed: onAction,
            child: const Text("View All", style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold)),
          ),
      ],
    );
  }

  Widget _buildBinStatusCard(String name, double filler, Color color, String emoji) {
    return Container(
      padding: const EdgeInsets.all(12),
      width: 120,
      decoration: AppTheme.cardDecoration,
      child: Column(
        children: [
          Row(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 4),
              Expanded(child: Text(name, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis)),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 4,
            child: LinearProgressIndicator(
              value: filler,
              backgroundColor: color.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation(color),
            ),
          ),
          const SizedBox(height: 8),
          Text("${(filler * 100).toInt()}%", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _buildScanLog() {
    final List<Map<String, String>> logs = [
      {"time": "9:42 AM", "type": "🌱 Organic", "weight": "+2.4 kg"},
      {"time": "9:31 AM", "type": "♻️ Recyclable", "weight": "+1.8 kg"},
      {"time": "9:15 AM", "type": "🌱 Organic", "weight": "+3.1 kg"},
      {"time": "8:58 AM", "type": "🗑️ Non-Recycle", "weight": "+0.9 kg"},
      {"time": "8:45 AM", "type": "♻️ Recyclable", "weight": "+2.2 kg"},
    ];

    return Container(
      decoration: AppTheme.cardDecoration,
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: logs.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final log = logs[index];
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Text(log["time"]!, style: const TextStyle(fontSize: 12, color: AppColors.gray)),
                const SizedBox(width: 16),
                Expanded(child: Text(log["type"]!, style: const TextStyle(fontWeight: FontWeight.bold))),
                Text(log["weight"]!, style: const TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildEcoPointsCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Eco Points Journey", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: AppColors.lightGreen, borderRadius: BorderRadius.circular(8)),
                child: const Text("A+", style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text("860 pts", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.primaryGreen)),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: 0.86,
              minHeight: 8,
              backgroundColor: AppColors.lightGreen,
              valueColor: const AlwaysStoppedAnimation(AppColors.primaryGreen),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text("C", style: TextStyle(fontSize: 10, color: AppColors.gray)),
              Text("B", style: TextStyle(fontSize: 10, color: AppColors.gray)),
              Text("B+", style: TextStyle(fontSize: 10, color: AppColors.gray)),
              Text("A", style: TextStyle(fontSize: 10, color: AppColors.gray)),
              Text("A+", style: TextStyle(fontSize: 10, color: AppColors.primaryGreen, fontWeight: FontWeight.bold)),
              Text("A++", style: TextStyle(fontSize: 10, color: AppColors.gray)),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            "140 more points to reach A++!",
            style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
