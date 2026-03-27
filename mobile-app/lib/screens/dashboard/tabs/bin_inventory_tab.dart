import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../theme/app_theme.dart';
import '../../../widgets/bin_gauge.dart';

class BinInventoryTab extends StatelessWidget {
  const BinInventoryTab({super.key});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => Future.delayed(const Duration(seconds: 1)),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Bin Inventory", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.darkText)),
            const Text("Weight sensor data • Updated Daily", style: TextStyle(color: AppColors.gray, fontSize: 12)),
            const SizedBox(height: 24),
            _buildLargeBinCard(
              context,
              name: "Organic Waste",
              emoji: "🌱",
              percentage: 0.72,
              color: AppColors.primaryGreen,
              weight: "144 kg / 200 kg",
              days: "3 Days",
              assigned: "GreenSoil Fertilizers",
              status: "Pickup Scheduled",
              history: [60, 65, 70, 68, 72, 74, 72],
            ),
            const SizedBox(height: 16),
            _buildLargeBinCard(
              context,
              name: "Recyclable Waste",
              emoji: "♻️",
              percentage: 0.45,
              color: Colors.blue,
              weight: "90 kg / 200 kg",
              days: "7 Days",
              assigned: "GreenRoad Constructions",
              status: "Active Collection",
              history: [30, 38, 42, 50, 55, 60, 90],
            ),
            const SizedBox(height: 16),
            _buildLargeBinCard(
              context,
              name: "Non-Recyclable Waste",
              emoji: "🗑️",
              percentage: 0.88,
              color: AppColors.dangerRed,
              weight: "176 kg / 200 kg",
              days: "1 Day ⚠️",
              assigned: "City Municipality",
              status: "URGENT - Request Pickup",
              history: [100, 120, 130, 140, 150, 165, 176],
              isUrgent: true,
            ),
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildLargeBinCard(
    BuildContext context, {
    required String name,
    required String emoji,
    required double percentage,
    required Color color,
    required String weight,
    required String days,
    required String assigned,
    required String status,
    required List<double> history,
    bool isUrgent = false,
  }) {
    return Container(
      decoration: AppTheme.cardDecoration.copyWith(
        border: isUrgent ? Border.all(color: AppColors.dangerRed, width: 2) : null,
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
                    child: Text(emoji, style: const TextStyle(fontSize: 20)),
                  ),
                  const SizedBox(width: 12),
                  Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: Text(status, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              BinGauge(percentage: percentage, color: color),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Current Weight", style: TextStyle(fontSize: 12, color: AppColors.gray)),
                  Text(weight, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Text("Days to Full: ", style: TextStyle(fontSize: 12, color: AppColors.gray)),
                      Text(days, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: percentage > 0.8 ? AppColors.dangerRed : AppColors.warningOrange)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Text("Assigned: ", style: TextStyle(fontSize: 12, color: AppColors.gray)),
                      Text(assigned, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 60,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: 200,
                barTouchData: BarTouchData(enabled: false),
                titlesData: FlTitlesData(show: false),
                gridData: FlGridData(show: false),
                borderData: FlBorderData(show: false),
                barGroups: List.generate(7, (i) => BarChartGroupData(
                  x: i,
                  barRods: [
                    BarChartRodData(
                      toY: history[i],
                      color: color,
                      width: 12,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ],
                )),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text("Mon", style: TextStyle(fontSize: 9, color: AppColors.gray)),
              Text("Tue", style: TextStyle(fontSize: 9, color: AppColors.gray)),
              Text("Wed", style: TextStyle(fontSize: 9, color: AppColors.gray)),
              Text("Thu", style: TextStyle(fontSize: 9, color: AppColors.gray)),
              Text("Fri", style: TextStyle(fontSize: 9, color: AppColors.gray)),
              Text("Sat", style: TextStyle(fontSize: 9, color: AppColors.gray)),
              Text("Sun", style: TextStyle(fontSize: 9, color: AppColors.gray)),
            ],
          ),
          if (isUrgent) ...[
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => _showRequestPickupSheet(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.dangerRed,
                foregroundColor: Colors.white,
              ),
              child: const Text("Request Pickup Now"),
            ),
          ],
        ],
      ),
    );
  }

  void _showRequestPickupSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 24),
              const Text("Request Emergency Pickup", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              const Text("Send pickup request to City Municipality?", style: TextStyle(color: AppColors.gray)),
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.gray)),
                      child: const Text("Cancel", style: TextStyle(color: AppColors.gray)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            backgroundColor: AppColors.primaryGreen,
                            content: Text("Pickup request sent ✅"),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.dangerRed),
                      child: const Text("Send Request"),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }
}
