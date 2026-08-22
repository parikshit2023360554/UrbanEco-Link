import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../services/factory_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_text_field.dart';

class CapacityManagementScreen extends StatefulWidget {
  const CapacityManagementScreen({super.key});

  @override
  State<CapacityManagementScreen> createState() => _CapacityManagementScreenState();
}

class _CapacityManagementScreenState extends State<CapacityManagementScreen> {
  late TextEditingController _availableCapacityController;

  @override
  void initState() {
    super.initState();
    final cap = context.read<FactoryService>().capacity;
    _availableCapacityController = TextEditingController(text: cap.todayAvailableCapacityKg.toStringAsFixed(0));
  }

  @override
  void dispose() {
    _availableCapacityController.dispose();
    super.dispose();
  }

  void _handleUpdateCapacity() {
    final newAvailable = double.tryParse(_availableCapacityController.text) ?? 4000.0;
    context.read<FactoryService>().updateTodayAvailableCapacity(newAvailable);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Today's Available Capacity updated successfully! Remaining capacity recalculated."),
        backgroundColor: AppColors.primary,
      ),
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final factoryService = context.watch<FactoryService>();
    final cap = factoryService.capacity;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Plant Capacity Settings'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 80.0),
        child: Column(
          children: [
            // Capacity Overview Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Processing Capacity Overview',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          '${cap.utilizationPercentage.toStringAsFixed(0)}% Reserved',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primaryDark),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: cap.utilizationPercentage / 100,
                      minHeight: 8,
                      backgroundColor: AppColors.bgSlate,
                      color: cap.utilizationPercentage > 85 ? AppColors.dangerText : AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Calculated Metrics
                  Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _CapacityStatBox(
                              title: 'Maximum Rating',
                              value: '${cap.maxCapacityKg.toStringAsFixed(0)} kg',
                              color: AppColors.neutralDark,
                              bgColor: AppColors.bgSlate,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _CapacityStatBox(
                              title: "Today's Available",
                              value: '${cap.todayAvailableCapacityKg.toStringAsFixed(0)} kg',
                              color: AppColors.primary,
                              bgColor: AppColors.primaryLight,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: _CapacityStatBox(
                              title: 'Reserved Payload',
                              value: '${cap.reservedCapacityKg.toStringAsFixed(0)} kg',
                              color: AppColors.warningText,
                              bgColor: AppColors.warningBg,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _CapacityStatBox(
                              title: 'Remaining Space',
                              value: '${cap.remainingCapacityKg.toStringAsFixed(0)} kg',
                              color: AppColors.infoText,
                              bgColor: AppColors.infoBg,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Manager Capacity Update Form Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Update Available Capacity",
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Specify active plant availability after factoring shift staffing and maintenance downtime.',
                    style: TextStyle(fontSize: 11, color: AppColors.neutralGray),
                  ),
                  const SizedBox(height: 14),

                  AppTextField(
                    label: "Today's Available Capacity (kg)",
                    hint: 'e.g. 4200',
                    controller: _availableCapacityController,
                    keyboardType: TextInputType.number,
                    prefixIcon: LucideIcons.gauge,
                  ),
                  const SizedBox(height: 16),

                  AppButton(
                    label: 'Update & Recalculate Capacity',
                    icon: LucideIcons.checkCircle2,
                    height: 44,
                    onPressed: _handleUpdateCapacity,
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

class _CapacityStatBox extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  final Color bgColor;

  const _CapacityStatBox({
    required this.title,
    required this.value,
    required this.color,
    required this.bgColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title.toUpperCase(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: color),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: color),
          ),
        ],
      ),
    );
  }
}
