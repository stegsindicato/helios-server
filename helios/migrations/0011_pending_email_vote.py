from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('helios', '0010_add_query_indexes'),
    ]

    operations = [
        migrations.CreateModel(
            name='PendingEmailVote',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('encrypted_vote', models.TextField()),
                ('vote_hash', models.CharField(max_length=100)),
                ('token_digest', models.CharField(max_length=64, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField()),
                ('used_at', models.DateTimeField(blank=True, null=True)),
                ('invalidated_at', models.DateTimeField(blank=True, null=True)),
                ('cast_vote', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='pending_email_votes', to='helios.castvote')),
                ('election', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='helios.election')),
            ],
            options={
                'indexes': [
                    models.Index(fields=['election', 'email'], name='helios_pev_elec_email_idx'),
                    models.Index(fields=['expires_at'], name='helios_pev_expires_idx'),
                ],
            },
        ),
    ]
