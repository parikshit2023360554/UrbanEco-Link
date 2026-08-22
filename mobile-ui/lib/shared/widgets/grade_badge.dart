import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class GradeBadge extends StatelessWidget {
  final String grade;
  final double size;

  const GradeBadge({
    super.key,
    this.grade = 'A+',
    this.size = 52.0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.primary, width: 2),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.15),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: Text(
          grade,
          maxLines: 1,
          softWrap: false,
          style: TextStyle(
            fontSize: size * 0.42,
            fontWeight: FontWeight.w900,
            color: AppColors.primaryDark,
            letterSpacing: -0.5,
          ),
        ),
      ),
    );
  }
}
