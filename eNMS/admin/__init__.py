from flask import Blueprint

bp = Blueprint(
    'admin_blueprint',
    __name__,
    url_prefix='/admin',
    template_folder='templates',
    static_folder='static'
)

from eNMS.base.helpers import add_classes
from eNMS.admin.models import Cluster, User, Parameters

add_classes(Cluster, User, Parameters)

import eNMS.admin.routes  # noqa: F401
