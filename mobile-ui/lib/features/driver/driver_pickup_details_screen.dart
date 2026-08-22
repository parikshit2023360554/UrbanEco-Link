import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/models/models.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/status_badge.dart';

class DriverPickupDetailsScreen extends StatelessWidget {
  final BatchAssignmentModel assignment;

  const DriverPickupDetailsScreen({super.key, required this.assignment});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: Text('Assignment: ${assignment.batchCode}'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Details Header Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      StatusBadge.streamCategory(assignment.streamCategory),
                      StatusBadge.pickupStatus(assignment.status),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    assignment.originSociety,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.neutralDark),
                  ),
                  const SizedBox(height: 4),
                  Text(assignment.pickupAddress, style: const TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                  const Divider(height: 24),

                  _InfoRow(label: 'Total Weight Payload', value: '${assignment.totalWeightKg} kg', icon: LucideIcons.scale),
                  const SizedBox(height: 10),
                  _InfoRow(label: 'Destination Factory', value: assignment.destinationFactoryName, icon: LucideIcons.factory),
                  const SizedBox(height: 10),
                  _InfoRow(label: 'ETA to Factory', value: assignment.etaMinutes, icon: LucideIcons.clock),
                  const SizedBox(height: 10),
                  _InfoRow(label: 'QR Code Token', value: assignment.qrCodeToken, icon: LucideIcons.qrCode),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Customer Contact Box
            AppCard(
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(LucideIcons.userCheck, color: AppColors.primary, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('RWA Representative', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
                        Text('+91 98765 43210 (Gate Security Desk)', style: TextStyle(fontSize: 11, color: AppColors.neutralGray)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.phone, color: AppColors.primary),
                    onPressed: () {},
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Route Map Preview Placeholder Box
            Container(
              width: double.infinity,
              height: 160,
              decoration: BoxDecoration(
                color: AppColors.neutralDark,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(LucideIcons.map, color: AppColors.tealAccent, size: 40),
                        SizedBox(height: 8),
                        Text('Interactive Navigation Map Preview', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                        Text('Sector 62 -> Industrial Zone Sector 18 (18 mins)', style: TextStyle(color: Colors.white70, fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            AppButton(
              label: 'Scan Society QR & Verify Pickup',
              icon: LucideIcons.qrCode,
              onPressed: () => Navigator.pushNamed(context, AppRoutes.driverQrScanner),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _InfoRow({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.primary),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.neutralGray)),
        const Spacer(),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
      ],
    );
  }
}
