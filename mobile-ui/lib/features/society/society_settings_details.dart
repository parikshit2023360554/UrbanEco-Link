import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_text_field.dart';

/// Personal Information Detail & Edit Screen
class PersonalInformationScreen extends StatefulWidget {
  const PersonalInformationScreen({super.key});

  @override
  State<PersonalInformationScreen> createState() => _PersonalInformationScreenState();
}

class _PersonalInformationScreenState extends State<PersonalInformationScreen> {
  final _nameController = TextEditingController(text: 'Anil Kumar');
  final _phoneController = TextEditingController(text: '+91 98765 43210');
  final _emailController = TextEditingController(text: 'rwa.greenwood@urbaneco.org');
  bool _isSaving = false;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _handleSave() async {
    setState(() => _isSaving = true);
    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    setState(() => _isSaving = false);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Personal information updated successfully!'), backgroundColor: AppColors.primary),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Personal Information'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('RWA Authorized Representative', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
                  const SizedBox(height: 14),
                  AppTextField(label: 'Full Name', controller: _nameController, prefixIcon: LucideIcons.user),
                  const SizedBox(height: 12),
                  AppTextField(label: 'Phone Number', controller: _phoneController, prefixIcon: LucideIcons.phone),
                  const SizedBox(height: 12),
                  AppTextField(label: 'Email Address', controller: _emailController, prefixIcon: LucideIcons.mail),
                  const SizedBox(height: 20),
                  AppButton(
                    label: _isSaving ? 'Saving Changes...' : 'Save Representative Details',
                    icon: LucideIcons.save,
                    isLoading: _isSaving,
                    onPressed: _handleSave,
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

/// Society Information Detail Screen
class SocietyInformationScreen extends StatefulWidget {
  const SocietyInformationScreen({super.key});

  @override
  State<SocietyInformationScreen> createState() => _SocietyInformationScreenState();
}

class _SocietyInformationScreenState extends State<SocietyInformationScreen> {
  final _socNameController = TextEditingController(text: 'Greenwood Heights RWA');
  final _socIdController = TextEditingController(text: 'SOC-9021');
  final _addressController = TextEditingController(text: 'Plot 4, Sector 62');
  final _cityController = TextEditingController(text: 'Eco City');
  final _stateController = TextEditingController(text: 'Karnataka');
  final _pinController = TextEditingController(text: '560062');
  final _householdsController = TextEditingController(text: '450');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Society Details'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Registered RWA Profile', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
                  const SizedBox(height: 14),
                  AppTextField(label: 'Society Name', controller: _socNameController, prefixIcon: LucideIcons.building2),
                  const SizedBox(height: 12),
                  AppTextField(label: 'Society ID', controller: _socIdController, prefixIcon: LucideIcons.badgeCheck),
                  const SizedBox(height: 12),
                  AppTextField(label: 'Street Address', controller: _addressController, prefixIcon: LucideIcons.mapPin),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: AppTextField(label: 'City', controller: _cityController)),
                      const SizedBox(width: 10),
                      Expanded(child: AppTextField(label: 'State', controller: _stateController)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: AppTextField(label: 'PIN Code', controller: _pinController)),
                      const SizedBox(width: 10),
                      Expanded(child: AppTextField(label: 'Households', controller: _householdsController)),
                    ],
                  ),
                  const SizedBox(height: 20),
                  AppButton(
                    label: 'Save Society Info',
                    icon: LucideIcons.save,
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Society info updated!'), backgroundColor: AppColors.primary),
                      );
                      Navigator.pop(context);
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

/// Change Password Screen
class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _currentController = TextEditingController();
  final _newController = TextEditingController();
  final _confirmController = TextEditingController();
  String? _errorMsg;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Change Password'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Update Account Credentials', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
                  const SizedBox(height: 14),

                  if (_errorMsg != null) ...[
                    Text(_errorMsg!, style: const TextStyle(color: AppColors.dangerText, fontSize: 12, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 10),
                  ],

                  AppTextField(label: 'Current Password', controller: _currentController, obscureText: true, prefixIcon: LucideIcons.lock),
                  const SizedBox(height: 12),
                  AppTextField(label: 'New Password', controller: _newController, obscureText: true, prefixIcon: LucideIcons.lock),
                  const SizedBox(height: 12),
                  AppTextField(label: 'Confirm New Password', controller: _confirmController, obscureText: true, prefixIcon: LucideIcons.check),
                  const SizedBox(height: 20),

                  AppButton(
                    label: 'Update Password',
                    icon: LucideIcons.shieldCheck,
                    onPressed: () {
                      if (_currentController.text.isEmpty) {
                        setState(() => _errorMsg = 'Please enter your current password.');
                        return;
                      }
                      if (_newController.text.length < 6) {
                        setState(() => _errorMsg = 'New password must be at least 6 characters.');
                        return;
                      }
                      if (_newController.text != _confirmController.text) {
                        setState(() => _errorMsg = 'New passwords do not match.');
                        return;
                      }

                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Password changed successfully!'), backgroundColor: AppColors.primary),
                      );
                      Navigator.pop(context);
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

/// Report a Problem Form Screen
class ReportProblemScreen extends StatefulWidget {
  const ReportProblemScreen({super.key});

  @override
  State<ReportProblemScreen> createState() => _ReportProblemScreenState();
}

class _ReportProblemScreenState extends State<ReportProblemScreen> {
  String _selectedCategory = 'Pickup Issue';
  final _descriptionController = TextEditingController();

  final List<String> _categories = ['Pickup Issue', 'Driver Issue', 'Forecast Discrepancy', 'App / System Issue'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Report a Problem'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Submit Ticket to Helpdesk', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
                  const SizedBox(height: 14),

                  const Text('Problem Category', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.neutralDark)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: _selectedCategory,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedCategory = val);
                    },
                  ),
                  const SizedBox(height: 14),

                  AppTextField(
                    label: 'Description of Issue',
                    hint: 'Provide details about the missed pickup or vehicle delay...',
                    controller: _descriptionController,
                    maxLines: 4,
                  ),
                  const SizedBox(height: 16),

                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.bgSlate,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.borderGray),
                    ),
                    child: Column(
                      children: const [
                        Icon(LucideIcons.camera, color: AppColors.neutralGray, size: 24),
                        SizedBox(height: 4),
                        Text('Attach Photo (Optional)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.neutralDark)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  AppButton(
                    label: 'Submit Support Ticket',
                    icon: LucideIcons.send,
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Support ticket submitted! Ticket #TCK-9901'), backgroundColor: AppColors.primary),
                      );
                      Navigator.pop(context);
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
