import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../services/driver_service.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/status_badge.dart';
import 'driver_pickup_details_screen.dart';

class TodaysAssignmentsScreen extends StatelessWidget {
  const TodaysAssignmentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final driverService = context.watch<DriverService>();
    final assignments = driverService.assignments;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text("Today's Logistics Assignments"),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 80.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Assigned Pickups (${assignments.length})',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Text('EV Vehicle: KA-01-EV-2026', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primaryDark)),
                ),
              ],
            ),
            const SizedBox(height: 14),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: assignments.length,
              itemBuilder: (context, index) {
                final item = assignments[index];
                return AppCard(
                  margin: const EdgeInsets.only(bottom: 12),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => DriverPickupDetailsScreen(assignment: item),
                      ),
                    );
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          StatusBadge.streamCategory(item.streamCategory),
                          StatusBadge.pickupStatus(item.status),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.originSociety, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.neutralDark)),
                                const SizedBox(height: 2),
                                Text(item.pickupAddress, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: AppColors.neutralGray)),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text('${item.totalWeightKg.toStringAsFixed(0)} kg', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
                        ],
                      ),
                      const Divider(height: 16),
                      Row(
                        children: [
                          const Icon(LucideIcons.factory, size: 14, color: AppColors.primary),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'Dest: ${item.destinationFactoryName}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.neutralDark),
                            ),
                          ),
                          const Icon(LucideIcons.chevronRight, size: 16, color: AppColors.neutralGray),
                        ],
                      ),
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
