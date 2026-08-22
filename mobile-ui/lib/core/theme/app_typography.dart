import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Typography tuned for 1080×2400 screens (~360×800 logical dp at 3× density).
abstract class AppTypography {
  static const double screenTitle = 17;
  static const double screenSubtitle = 11;
  static const double sectionTitle = 13;
  static const double body = 12;
  static const double bodySmall = 11;
  static const double caption = 10;
  static const double button = 12;
  static const double navLabel = 10;
  static const double statValue = 15;
  static const double statLabel = 10;
  static const double loginTitle = 20;
  static const double loginSubtitle = 12;

  static const TextStyle loginSubtitleStyle = TextStyle(
    fontSize: loginSubtitle,
    color: AppColors.neutralGray,
    height: 1.35,
  );

  static const TextStyle screenTitleStyle = TextStyle(
    fontSize: screenTitle,
    fontWeight: FontWeight.w700,
    color: AppColors.neutralDark,
    letterSpacing: -0.2,
    height: 1.25,
  );

  static const TextStyle screenSubtitleStyle = TextStyle(
    fontSize: screenSubtitle,
    color: AppColors.neutralGray,
    height: 1.3,
  );

  static const TextStyle sectionTitleStyle = TextStyle(
    fontSize: sectionTitle,
    fontWeight: FontWeight.w700,
    color: AppColors.neutralDark,
  );

  static const TextStyle bodyStyle = TextStyle(
    fontSize: body,
    fontWeight: FontWeight.w500,
    color: AppColors.neutralDark,
  );

  static const TextStyle bodySmallStyle = TextStyle(
    fontSize: bodySmall,
    color: AppColors.neutralGray,
  );

  static const TextStyle captionStyle = TextStyle(
    fontSize: caption,
    fontWeight: FontWeight.w600,
    color: AppColors.neutralGray,
  );
}
