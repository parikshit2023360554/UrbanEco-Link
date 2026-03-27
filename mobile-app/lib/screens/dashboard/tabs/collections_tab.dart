import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

class CollectionsTab extends StatelessWidget {
  const CollectionsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Collections", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.darkText)),
          const SizedBox(height: 24),

          // Summary Chips
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSummaryChip("🚛 Total", "31"),
              _buildSummaryChip("✅ Done", "28"),
              _buildSummaryChip("📅 Next", "3"),
              _buildSummaryChip("❌ Miss", "0"),
            ],
          ),
          const SizedBox(height: 32),

          const Text("Upcoming Pickups", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildCollectionCard(
            context,
            org: "GreenSoil Fertilizers",
            type: "Organic",
            status: "Confirmed",
            initial: "GS",
            color: AppColors.primaryGreen,
            date: "Tomorrow, 27 Mar",
            time: "10:00 AM",
            batch: "#2024-091",
            weight: "162 kg",
            progress: 0.6,
          ),
          const SizedBox(height: 16),
          _buildCollectionCard(
            context,
            org: "GreenRoad Constructions",
            type: "Recyclable",
            status: "Scheduled",
            initial: "GR",
            color: Colors.blue,
            date: "28 Mar",
            time: "2:00 PM",
            batch: "#2024-092",
            weight: "45 kg",
            progress: 0.4,
          ),
          const SizedBox(height: 16),
          _buildCollectionCard(
            context,
            org: "City Municipality",
            type: "Non-Recycle",
            status: "Urgent",
            initial: "CM",
            color: AppColors.dangerRed,
            date: "TODAY",
            time: "6:00 PM",
            batch: "#2024-093",
            weight: "176 kg",
            progress: 0.8,
            isTrackable: true,
          ),
          const SizedBox(height: 32),

          const Text("Collection History", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildFilterChips(),
          const SizedBox(height: 16),
          _buildHistoryList(),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildSummaryChip(String label, String count) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(12)),
      child: Column(
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: AppColors.gray)),
          Text(count, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildCollectionCard(
    BuildContext context, {
    required String org,
    required String type,
    required String status,
    required String initial,
    required Color color,
    required String date,
    required String time,
    required String batch,
    required String weight,
    required double progress,
    bool isTrackable = false,
  }) {
    return Container(
      decoration: AppTheme.cardDecoration.copyWith(
        border: isTrackable ? Border.all(color: AppColors.dangerRed, width: 2) : null,
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(backgroundColor: color, radius: 20, child: Text(initial, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(org, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text(type, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: Text(status, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(Icons.access_time, size: 14, color: AppColors.gray),
              const SizedBox(width: 6),
              Text("$date • $time", style: const TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 4),
          Text("Batch: $batch • ~$weight", style: const TextStyle(color: AppColors.gray, fontSize: 12)),
          const SizedBox(height: 20),
          Row(
            children: List.generate(5, (i) {
              bool active = i < (progress * 5).toInt();
              return Expanded(
                child: Container(
                  height: 6,
                  margin: EdgeInsets.only(right: i < 4 ? 4 : 0),
                  decoration: BoxDecoration(
                    color: active ? color : Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 20),
          isTrackable
              ? ElevatedButton(
                  onPressed: () => _showTrackingSheet(context),
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.dangerRed),
                  child: const Text("Track Pickup"),
                )
              : OutlinedButton(
                  onPressed: () => _showDetailsSheet(context, org, date, time),
                  child: const Text("View Details"),
                ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return Row(
      children: [
        _buildFilterChip("All", true),
        _buildFilterChip("This Week", false),
        _buildFilterChip("This Month", false),
      ],
    );
  }

  Widget _buildFilterChip(String label, bool active) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(color: active ? AppColors.primaryGreen : Colors.grey.shade100, borderRadius: BorderRadius.circular(20)),
      child: Text(label, style: TextStyle(color: active ? Colors.white : AppColors.gray, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildHistoryList() {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 8,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        return Container(
          decoration: AppTheme.cardDecoration,
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("24 Mar • BATCH #2024-0${85 - index}", style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text("Recyclable • 92 kg • GreenRoad", style: const TextStyle(fontSize: 12, color: AppColors.gray)),
                  ],
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.verified, color: AppColors.primaryGreen, size: 16),
                  const SizedBox(width: 8),
                  TextButton(onPressed: () {}, child: const Text("View", style: TextStyle(color: AppColors.primaryGreen))),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  void _showDetailsSheet(BuildContext context, String org, String date, String time) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("Collection Details", style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Text("$org • $date • $time"),
              const SizedBox(height: 32),
              Center(child: TextButton(onPressed: () => Navigator.pop(context), child: const Text("Close"))),
            ],
          ),
        );
      },
    );
  }

  void _showTrackingSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        final List<Map<String, dynamic>> steps = [
          {"s": "Batch Created", "t": "26 Mar 6:00 AM", "d": true},
          {"s": "Assigned", "t": "26 Mar 6:01 AM", "d": true},
          {"s": "Confirmed", "t": "26 Mar 9:00 AM", "d": true},
          {"s": "Driver En Route", "t": "Expected 6:00 PM", "d": false},
          {"s": "QR Scanned", "t": "Pending", "d": false},
          {"s": "Complete", "t": "Pending", "d": false},
        ];
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Tracking Pickup", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 24),
              ...steps.map((s) => Row(
                children: [
                  Icon(s["d"] ? Icons.check_circle : Icons.radio_button_unchecked, color: s["d"] ? AppColors.primaryGreen : AppColors.gray, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(s["s"], style: TextStyle(fontWeight: FontWeight.bold, color: s["d"] ? AppColors.darkText : AppColors.gray)),
                        Text(s["t"], style: const TextStyle(fontSize: 10, color: AppColors.gray)),
                      ],
                    ),
                  ),
                ],
              )).toList(),
              const SizedBox(height: 32),
              Center(child: TextButton(onPressed: () => Navigator.pop(context), child: const Text("Close"))),
            ],
          ),
        );
      },
    );
  }
}
