import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../theme/app_theme.dart';

class BatchesTab extends StatefulWidget {
  const BatchesTab({super.key});

  @override
  State<BatchesTab> createState() => _BatchesTabState();
}

class _BatchesTabState extends State<BatchesTab> {
  String _activeFilter = 'All';

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Waste Batches", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.darkText)),
          const SizedBox(height: 24),

          // Sensor Status Bar
          _buildSensorStatusBar(),
          const SizedBox(height: 16),
          _buildManualBatchButton(context),
          const SizedBox(height: 32),

          // Summary Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSummaryChip("📦 Total", "24"),
              _buildSummaryChip("✅ Done", "18"),
              _buildSummaryChip("🔄 Active", "4"),
              _buildSummaryChip("⏳ Wait", "2"),
            ],
          ),
          const SizedBox(height: 32),

          const Text("Active Batches", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildBatchCard(
            context,
            id: "#2024-089",
            status: "In Progress",
            type: "Recyclable",
            emoji: "♻️",
            weight: "90 kg",
            org: "GreenRoad Constructions",
            date: "28 Mar 2026",
            steps: 2,
            isUrgent: false,
          ),
          const SizedBox(height: 16),
          _buildBatchCard(
            context,
            id: "#2024-090",
            status: "Urgent",
            type: "Non-Recyclable",
            emoji: "🗑️",
            weight: "176 kg",
            org: "City Municipality",
            date: "TODAY",
            steps: 1,
            isUrgent: true,
          ),
          const SizedBox(height: 32),

          const Text("Batch History", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildFilterRow(),
          const SizedBox(height: 16),
          _buildBatchHistoryList(),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildSensorStatusBar() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildStatusDot("Organic Online", Colors.green),
        _buildStatusDot("Recyclable Online", Colors.green),
        _buildStatusDot("Non-Recycle OFFLINE", Colors.red),
      ],
    );
  }

  Widget _buildStatusDot(String label, Color color) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildManualBatchButton(BuildContext context) {
    return OutlinedButton(
      onPressed: () => _showManualBatchSheet(context),
      style: OutlinedButton.styleFrom(
        side: const BorderSide(color: AppColors.warningOrange),
        foregroundColor: AppColors.warningOrange,
      ),
      child: const Text("⚠️ Create Batch Manually"),
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

  Widget _buildBatchCard(
    BuildContext context, {
    required String id,
    required String status,
    required String type,
    required String emoji,
    required String weight,
    required String org,
    required String date,
    required int steps,
    bool isUrgent = false,
  }) {
    Color color = isUrgent ? AppColors.dangerRed : Colors.blue;
    return Container(
      decoration: AppTheme.cardDecoration.copyWith(
        border: Border(left: BorderSide(color: color, width: 4)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(id, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                child: Text(status, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text("$emoji $type • $weight", style: const TextStyle(fontWeight: FontWeight.bold)),
          Text("Assigned: $org", style: const TextStyle(color: AppColors.gray, fontSize: 12)),
          Row(
            children: [
              const Text("Pickup Due: ", style: TextStyle(color: AppColors.gray, fontSize: 12)),
              Text(date, style: TextStyle(color: isUrgent ? AppColors.dangerRed : AppColors.darkText, fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(4, (i) {
              bool done = i < steps;
              bool current = i == steps;
              return Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: done ? AppColors.primaryGreen : (current ? color : Colors.grey.shade300),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(done ? Icons.check : Icons.more_horiz, size: 14, color: Colors.white),
                  ),
                  if (i < 3) Container(width: 40, height: 2, color: done ? AppColors.primaryGreen : Colors.grey.shade300),
                ],
              );
            }),
          ),
          const SizedBox(height: 20),
          if (isUrgent)
            ElevatedButton(
              onPressed: () => _showQrSheet(context, id, type, weight, org, date),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.dangerRed),
              child: const Text("View QR Code"),
            )
          else
            OutlinedButton(
              onPressed: () => _showQrSheet(context, id, type, weight, org, date),
              child: const Text("View QR Code"),
            ),
        ],
      ),
    );
  }

  Widget _buildFilterRow() {
    final List<String> filters = ['All', 'Completed', 'In Progress', 'Pending'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: filters.map((f) => Padding(
          padding: const EdgeInsets.only(right: 8),
          child: GestureDetector(
            onTap: () => setState(() => _activeFilter = f),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: _activeFilter == f ? AppColors.primaryGreen : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                f,
                style: TextStyle(color: _activeFilter == f ? Colors.white : AppColors.gray, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildBatchHistoryList() {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 10,
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
                    Text("BATCH #2024-0${80 - index}", style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text("Recyclable • 88 kg", style: const TextStyle(fontSize: 12, color: AppColors.gray)),
                    Text("GreenSoil Fertilizers", style: const TextStyle(fontSize: 12, color: AppColors.gray)),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text("24 Mar 2026", style: TextStyle(fontSize: 10, color: AppColors.gray)),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: () => _showBatchDetailsSheet(context),
                    child: const Text("View Details", style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  void _showManualBatchSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 24, right: 24, top: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 24),
              const Text("Create Batch Manually", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.warningOrange.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: const Text("Only use if automatic system has failed. Will be logged.", style: TextStyle(color: AppColors.warningOrange, fontSize: 12)),
              ),
              const SizedBox(height: 20),
              _buildSimpleDropdown("Select Bin Type", ["Organic", "Recyclable", "Non-Recycle"]),
              const SizedBox(height: 16),
              const TextField(decoration: InputDecoration(hintText: "Estimated Weight (kg)", labelText: "Weight")),
              const SizedBox(height: 16),
              _buildSimpleDropdown("Reason", ["Sensor Malfunction", "Sensor Offline", "Emergency Overflow", "Other"]),
              const SizedBox(height: 16),
              const TextField(decoration: InputDecoration(hintText: "Additional Notes", labelText: "Notes")),
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(backgroundColor: AppColors.primaryGreen, content: Text("Batch created manually ✅ Logged for review")));
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.warningOrange),
                      child: const Text("Create Batch"),
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

  Widget _buildSimpleDropdown(String hint, List<String> items) {
    return DropdownButtonFormField<String>(
      decoration: InputDecoration(labelText: hint),
      items: items.map((i) => DropdownMenuItem(value: i, child: Text(i))).toList(),
      onChanged: (v) {},
    );
  }

  void _showQrSheet(BuildContext context, String id, String type, String weight, String org, String date) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text("Batch QR — ", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text(id, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryGreen)),
              const SizedBox(height: 8),
              Text("$type • $weight • $org", style: const TextStyle(color: AppColors.gray)),
              const SizedBox(height: 24),
              QrImageView(
                data: "BATCH-$id-$org-$weight",
                version: QrVersions.auto,
                size: 200.0,
              ),
              const SizedBox(height: 16),
              const Text("Show to driver on arrival", style: TextStyle(color: AppColors.gray, fontSize: 12)),
              const SizedBox(height: 24),
              TextButton(onPressed: () => Navigator.pop(context), child: const Text("Close", style: TextStyle(color: AppColors.gray))),
            ],
          ),
        );
      },
    );
  }

  void _showBatchDetailsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        final List<String> steps = ["Batch Created", "Assigned to Organization", "QR Generated", "Picked Up", "Confirmed"];
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Batch Details", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 24),
              ...steps.map((s) => Row(
                children: [
                  const Icon(Icons.check_circle, color: AppColors.primaryGreen, size: 20),
                  const SizedBox(width: 12),
                  Text(s, style: const TextStyle(fontWeight: FontWeight.bold)),
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
