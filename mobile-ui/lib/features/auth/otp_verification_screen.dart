import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_text_field.dart';

class OtpVerificationScreen extends StatefulWidget {
  const OtpVerificationScreen({super.key});

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final _otpController = TextEditingController(text: '8942');

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('OTP Verification'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Enter 4-Digit Code',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppColors.neutralDark,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'We sent a verification code to your registered email.',
                  style: TextStyle(fontSize: 13, color: AppColors.neutralGray),
                ),
                const SizedBox(height: 20),
                AppTextField(
                  label: 'Verification Code',
                  hint: '8942',
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  prefixIcon: LucideIcons.shieldCheck,
                ),
                const SizedBox(height: 24),
                AppButton(
                  label: 'Verify & Login',
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('OTP Verified successfully!'),
                        backgroundColor: AppColors.primary,
                      ),
                    );
                    Navigator.pushNamedAndRemoveUntil(context, AppRoutes.login, (r) => false);
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
