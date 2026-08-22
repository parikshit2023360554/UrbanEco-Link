import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../services/auth_service.dart';
import '../../services/factory_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/status_badge.dart';

class FactoryProfileScreen extends StatelessWidget {
  const FactoryProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final factoryService = context.watch<FactoryService>();
    final user = auth.currentUser;
    final statusConfig = factoryService.statusConfig;
    final cap = factoryService.capacity;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Factory Profile'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.settings),
            onPressed: () => Navigator.pushNamed(context, AppRoutes.factorySettings),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 80.0),
        child: Column(
          children: [
            AppCard(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const CircleAvatar(
                        radius: 26,
                        backgroundColor: AppColors.primaryLight,
                        child: Icon(LucideIcons.factory, size: 24, color: AppColors.primary),
                      ),
                      StatusBadge.factoryStatus(statusConfig.status),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      user?.name ?? 'EcoMatrix Facility #4',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text('Bio-Composting & Material Recovery Plant • Sector 18', style: TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                  ),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _ProfileMetric(title: 'Max Rating', value: '${cap.maxCapacityKg.toStringAsFixed(0)} kg'),
                      _ProfileMetric(title: 'Available', value: '${cap.todayAvailableCapacityKg.toStringAsFixed(0)} kg'),
                      _ProfileMetric(title: 'Recovery %', value: '94.2%'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('Facility Operational Parameters', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.neutralDark)),
                  SizedBox(height: 10),
                  _DetailRow(label: 'Plant Code', value: 'FAC-01-ECO-MATRIX'),
                  Divider(height: 16),
                  _DetailRow(label: 'Weighbridge Gate', value: 'Gate 4 Industrial Belt'),
                  Divider(height: 16),
                  _DetailRow(label: 'Primary Waste Stream', value: 'Wet Organic & Dry Recyclables'),
                  Divider(height: 16),
                  _DetailRow(label: 'Control Room Phone', value: '+91 1800-FACTORY-HQ'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            AppButton(
              label: 'Factory Configuration & Settings',
              icon: LucideIcons.settings,
              type: AppButtonType.outline,
              height: 44,
              onPressed: () => Navigator.pushNamed(context, AppRoutes.factorySettings),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileMetric extends StatelessWidget {
  final String title;
  final String value;
  const _ProfileMetric({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primary)),
        Text(title, style: const TextStyle(fontSize: 11, color: AppColors.neutralGray)),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.neutralGray)),
        Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.neutralDark)),
      ],
    );
  }
}
