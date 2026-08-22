import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/models/models.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/status_badge.dart';

class PickupTrackingTimelineScreen extends StatelessWidget {
  final PickupRequestModel pickup;

  const PickupTrackingTimelineScreen({super.key, required this.pickup});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> stages = [
      {'title': 'Request Created', 'desc': 'Pickup logged by Greenwood Heights RWA', 'done': true},
      {'title': 'Confirmed', 'desc': 'AI Forecast & time window verified', 'done': true},
      {'title': 'Driver Assigned', 'desc': 'Vikram Singh (KA-01-EV-2026) assigned', 'done': true},
      {'title': 'Driver En Route', 'desc': 'Truck dispatched to Gate 2 Main Yard', 'done': true},
      {'title': 'Driver Arrived', 'desc': 'Vehicle at collection point', 'done': false},
      {'title': 'Waste Collected', 'desc': 'QR Code QR_WET_89234 scanned & verified', 'done': false},
      {'title': 'In Transit', 'desc': 'En route to EcoMatrix Processing Facility #4', 'done': false},
      {'title': 'Factory Received', 'desc': 'Weighbridge intake verified', 'done': false},
      {'title': 'Processing', 'desc': 'Bio-composting & material recovery', 'done': false},
      {'title': 'Completed', 'desc': 'Material balance recorded & eco-points credited', 'done': false},
    ];

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Live Pickup Tracking'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Status Header Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      StatusBadge.streamCategory(pickup.streamCategory),
                      StatusBadge.pickupStatus(pickup.status),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '${pickup.weightKg} kg Payload Pickup',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.neutralDark),
                  ),
                  const SizedBox(height: 2),
                  Text(pickup.address, style: const TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                  const Divider(height: 20),
                  Row(
                    children: [
                      const Icon(LucideIcons.truck, size: 18, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Text(
                        'Assigned Driver: ${pickup.assignedDriverName ?? "Pending"}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 10-Stage Timeline Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '10-Stage Logistics Pipeline',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.neutralDark),
                  ),
                  const SizedBox(height: 16),

                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: stages.length,
                    itemBuilder: (context, index) {
                      final stage = stages[index];
                      final isDone = stage['done'] as bool;
                      final isLast = index == stages.length - 1;

                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 22,
                                height: 22,
                                decoration: BoxDecoration(
                                  color: isDone ? AppColors.primary : AppColors.borderGray,
                                  shape: BoxShape.circle,
                                ),
                                child: isDone
                                    ? const Icon(LucideIcons.check, size: 14, color: Colors.white)
                                    : null,
                              ),
                              if (!isLast)
                                Container(
                                  width: 2,
                                  height: 36,
                                  color: isDone ? AppColors.primary : AppColors.borderGray,
                                ),
                            ],
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    stage['title'] as String,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: isDone ? FontWeight.w800 : FontWeight.w600,
                                      color: isDone ? AppColors.neutralDark : AppColors.neutralGray,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    stage['desc'] as String,
                                    style: const TextStyle(fontSize: 11, color: AppColors.neutralGray),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
