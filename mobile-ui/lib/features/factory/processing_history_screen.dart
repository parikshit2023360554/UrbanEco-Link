import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../services/factory_service.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/status_badge.dart';

class ProcessingHistoryScreen extends StatefulWidget {
  const ProcessingHistoryScreen({super.key});

  @override
  State<ProcessingHistoryScreen> createState() => _ProcessingHistoryScreenState();
}

class _ProcessingHistoryScreenState extends State<ProcessingHistoryScreen> {
  String _selectedTab = 'PROCESSING';

  @override
  Widget build(BuildContext context) {
    final factoryService = context.watch<FactoryService>();
    final logs = factoryService.processingLogs;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Factory History & Logs'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 80.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Tabs Row
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _TabChip(label: 'Processing', isSelected: _selectedTab == 'PROCESSING', onTap: () => setState(() => _selectedTab = 'PROCESSING')),
                  const SizedBox(width: 8),
                  _TabChip(label: 'Capacity Logs', isSelected: _selectedTab == 'CAPACITY', onTap: () => setState(() => _selectedTab = 'CAPACITY')),
                  const SizedBox(width: 8),
                  _TabChip(label: 'Maintenance', isSelected: _selectedTab == 'MAINTENANCE', onTap: () => setState(() => _selectedTab = 'MAINTENANCE')),
                ],
              ),
            ),
            const SizedBox(height: 16),

            if (_selectedTab == 'PROCESSING') ...[
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: logs.length,
                itemBuilder: (context, index) {
                  final item = logs[index];
                  return AppCard(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            StatusBadge.streamCategory(item.streamCategory),
                            StatusBadge.pickupStatus(item.processingStatus),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(item.batchCode, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
                        const SizedBox(height: 4),
                        Text('Intake Weight: ${item.receivedWeightKg} kg • Recovered: ${item.processedWeightKg} kg', style: const TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                        const Divider(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Recovery Efficiency', style: TextStyle(fontSize: 11, color: AppColors.neutralGray)),
                            Text('${item.recoveryRatePercentage.toStringAsFixed(1)}%', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.primary)),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ] else if (_selectedTab == 'CAPACITY') ...[
              const AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Capacity Log: 2026-08-08', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                    SizedBox(height: 4),
                    Text('Today Available: 4,200 kg • Reserved: 1,850 kg • Remaining: 2,350 kg', style: TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                  ],
                ),
              ),
            ] else ...[
              const AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(LucideIcons.wrench, size: 16, color: AppColors.dangerText),
                        SizedBox(width: 8),
                        Text('Conveyor Maintenance Calibration', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                      ],
                    ),
                    SizedBox(height: 4),
                    Text('Downtime: 2 hours • Completed & Back Operational', style: TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _TabChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _TabChip({required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.borderGray),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : AppColors.neutralDark,
          ),
        ),
      ),
    );
  }
}
