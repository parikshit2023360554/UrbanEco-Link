import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';

class DailyCapacityReminderCard extends StatelessWidget {
  const DailyCapacityReminderCard({super.key});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      backgroundColor: AppColors.primaryLight.withOpacity(0.4),
      borderColor: AppColors.primary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(LucideIcons.sun, color: AppColors.primary, size: 20),
              SizedBox(width: 8),
              Text(
                'Good Morning',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.neutralDark),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            "Please update today's available processing capacity before shift allocations start.",
            style: TextStyle(fontSize: 12, color: AppColors.neutralGray, height: 1.4),
          ),
          const SizedBox(height: 14),
          AppButton(
            label: "Update Available Capacity",
            icon: LucideIcons.gauge,
            height: 40,
            onPressed: () => Navigator.pushNamed(context, AppRoutes.factoryCapacity),
          ),
        ],
      ),
    );
  }
}
