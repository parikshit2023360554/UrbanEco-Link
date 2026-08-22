import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../services/society_service.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/grade_badge.dart';

class TrustGradeScreen extends StatelessWidget {
  const TrustGradeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final societyService = context.watch<SocietyService>();
    final tg = societyService.trustGrade;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('UrbanEco Grade & Trust Score'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Reputation Card
            AppCard(
              backgroundColor: Colors.white,
              borderColor: AppColors.primary,
              child: Column(
                children: [
                  const GradeBadge(grade: 'A+', size: 72),
                  const SizedBox(height: 12),
                  Text(
                    '${tg.score} / 100 Platform Rating',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.neutralDark),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    tg.badgeName,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Objective rating calculated from measured collection logs, segregation audits & prompt forecast confirmations.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: AppColors.neutralGray),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              'Measurable Score Breakdown',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.neutralDark),
            ),
            const SizedBox(height: 12),

            AppCard(
              child: Column(
                children: [
                  _ScoreRow(
                    label: 'SWM 2026 Compliance Rate',
                    value: '${tg.complianceRatePercent}%',
                    subtext: 'Timely waste pickup handoffs',
                    icon: LucideIcons.shieldCheck,
                    color: AppColors.primary,
                  ),
                  const Divider(height: 24),
                  _ScoreRow(
                    label: 'Segregation Audit Accuracy',
                    value: '${tg.segregationAccuracyPercent}%',
                    subtext: 'Weighbridge purity verification',
                    icon: LucideIcons.recycle,
                    color: AppColors.infoText,
                  ),
                  const Divider(height: 24),
                  _ScoreRow(
                    label: 'Total Pickups Completed',
                    value: '${tg.totalPickupsCompleted} Jobs',
                    subtext: 'Verified logistics cycles',
                    icon: LucideIcons.truck,
                    color: AppColors.warningText,
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

class _ScoreRow extends StatelessWidget {
  final String label;
  final String value;
  final String subtext;
  final IconData icon;
  final Color color;

  const _ScoreRow({
    required this.label,
    required this.value,
    required this.subtext,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 22),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
              Text(subtext, style: const TextStyle(fontSize: 11, color: AppColors.neutralGray)),
            ],
          ),
        ),
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: color)),
      ],
    );
  }
}
