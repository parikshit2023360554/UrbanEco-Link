import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../services/driver_service.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/status_badge.dart';

class DriverHistoryScreen extends StatelessWidget {
  const DriverHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final driverService = context.watch<DriverService>();
    final assignments = driverService.assignments;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Driver Job History'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text('Completed Deliveries Log', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.neutralDark)),
              ],
            ),
            const SizedBox(height: 16),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: assignments.length,
              itemBuilder: (context, index) {
                final item = assignments[index];
                return AppCard(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(LucideIcons.checkCircle2, color: AppColors.primary, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.originSociety, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
                            Text('${item.streamCategory} Stream • ${item.totalWeightKg} kg Delivered', style: const TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                          ],
                        ),
                      ),
                      StatusBadge.pickupStatus(item.status),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
