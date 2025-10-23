from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

# -------------------------
# Account (for login users)
# -------------------------
class AccountManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class Account(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = AccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

# -------------------------
# Company Information (per Account, usually only one record per user)
# -------------------------
class Company(models.Model):
    user = models.OneToOneField(Account, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    address = models.TextField()
    gstin = models.CharField(max_length=20)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)

    def __str__(self):
        return self.name

# -------------------------
# Client (for business data)
# -------------------------


class Client(models.Model):
    # Basic Details
    name = models.CharField(max_length=255)  # Company Name
    contact_person = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    billing_address = models.TextField(blank=True, null=True)
    billing_city = models.CharField(max_length=100, blank=True, null=True)
    billing_state = models.CharField(max_length=100, blank=True, null=True)
    billing_pincode = models.CharField(max_length=10, blank=True, null=True)

    shipping_address = models.TextField(blank=True, null=True)
    shipping_city = models.CharField(max_length=100, blank=True, null=True)
    shipping_state = models.CharField(max_length=100, blank=True, null=True)
    shipping_pincode = models.CharField(max_length=10, blank=True, null=True)

    
    # Optional Details
    gstin = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name



# -------------------------
# Bank Details (usually tied to each company/account or each invoice)
# -------------------------
class BankDetail(models.Model):
    # Link to company if static; to invoice if customized for each
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    account_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=30)
    ifsc_code = models.CharField(max_length=20)
    bank_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.bank_name} ({self.account_number})"

# -------------------------
# Invoice and Items
# -------------------------
class Invoice(models.Model):
    DRAFT = 'draft'
    FINALIZED = 'finalized'
    CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (FINALIZED, 'Finalized'),
        (CANCELLED, 'Cancelled'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='invoices')
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=30, unique=True)
    issue_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    billing_address = models.TextField(blank=True, null=True)
    billing_city = models.CharField(max_length=100, blank=True, null=True)
    billing_state = models.CharField(max_length=100, blank=True, null=True)
    billing_pincode = models.CharField(max_length=10, blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    shipping_city = models.CharField(max_length=100, blank=True, null=True)
    shipping_state = models.CharField(max_length=100, blank=True, null=True)
    shipping_pincode = models.CharField(max_length=10, blank=True, null=True)
    shipping_gstin = models.CharField(max_length=20, blank=True, null=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cgst = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    sgst = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    igst = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tds = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    terms = models.TextField(blank=True, null=True)
    payment_due_date = models.DateField(blank=True, null=True)
    authorized_signature = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Invoice {self.invoice_number} for {self.client.name}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=255)
    hsn_sac = models.CharField(max_length=20, blank=True, null=True)
    quantity = models.PositiveIntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.description} ({self.quantity})"

# -------------------------
# Payment (optional, tracks amount received)
# -------------------------
class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    method = models.CharField(max_length=50)
    reference = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"₹{self.amount} for {self.invoice.invoice_number}"

# -------------------------
# Activity Log (optional, for dashboard history)
# -------------------------
class ActivityLog(models.Model):
    user = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.timestamp} - {self.action}"
